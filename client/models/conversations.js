const groupBy = require('lodash/groupby')
const keyBy = require('lodash/keyby')
const merge = require('lodash/merge')
const cloneDeep = require('lodash/clonedeep')
const omit = require('lodash/omit')
const PouchDB = require('pouchdb')
const shortid = require('shortid')
const series = require('run-series')
const extend = require('xtend')

if (process.env.NODE_ENV === 'development') window.PouchDB = PouchDB

const db = new PouchDB('messages')
db.sync(process.env.COUCH_DB_URL + '/messages', {
  live: true,
  retry: true
})

module.exports = {
  state: {
    conversations: {},
    isAddingConversation: false
  },
  reducers: {
    receive: (messages, state) => {
      const newConversations = createIndexes(messages)
      const oldConversations = cloneDeep(state.conversations) // because merge mutates
      const mergedConversations = merge(oldConversations, newConversations)
      return { conversations: mergedConversations }
    },
    remove: (messageId, state) => {
      const newConversations = extend(state.conversations)
      for (let phone in state.conversations) {
        if (state.conversations[phone][messageId]) {
          newConversations[phone] = omit(state.conversations[phone], messageId)
        }
      }
      return { conversations: newConversations }
    },
    setAddingConversation: (isAddingConversation, state) => {
      return { isAddingConversation }
    },
    addConversation: (phone, state) => {
      if (!state.conversations[phone]) {
        const emptyConvo = {}
        emptyConvo[phone] = {}
        const newConversations = extend(state.conversations, emptyConvo)
        return { conversations: newConversations }
      }
    }
  },
  effects: {
    fetch: (data, state, send, done) => {
      db.allDocs({ include_docs: true, startkey: 'msg-' }, (err, result) => {
        if (err) return console.error('Error fetching docs', err)
        console.log(result)
        const messages = result.rows.map((row) => row.doc)
        send('receive', messages, done)
      })
    },
    outbound: (data, state, send, done) => {
      console.log('sending message: ' + data.body)
      data._id = `draft-${Date.now()}-${shortid.generate()}`
      data.direction = 'outbound'
      db.put(data, (err, response) => {
        if (err) return done(new Error('Error posting doc'))
        done() // if outbound is successful, new message is emitted & received via subscription
      })
    },
    addAndRedirect: (phone, state, send, done) => {
      series([
        (cb) => send('setAddingConversation', false, cb),
        (cb) => send('addConversation', phone, cb),
        (cb) => {
          const location = '/' + phone
          window.history.pushState({}, null, location)
          send('location:setLocation', { location }, cb)
        }
      ])
    }
  },
  subscriptions: {
    receiveMessages: (send, done) => {
      db.changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', (change) => {
        if (!['msg', 'draft'].includes(change.id.split('-')[0])) return // filter out design docs
        console.log('change', change)
        if (change.deleted) {
          send('remove', change.id, done)
        } else {
          send('receive', [change.doc], done)
        }
      })
    }
  }
}

function createIndexes (messages) {
  const convosByPhone = groupBy(messages, (msg) => msg.direction === 'inbound' ? msg.from : msg.to)
  const convosByPhoneByID = {}
  for (let phone in convosByPhone) {
    convosByPhoneByID[phone] = keyBy(convosByPhone[phone], '_id')
  }
  return convosByPhoneByID
}

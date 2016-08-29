const groupBy = require('lodash/groupby')
const keyBy = require('lodash/keyby')
const merge = require('lodash/merge')
const cloneDeep = require('lodash/clonedeep')
const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-authentication'))
const shortid = require('shortid')
const series = require('run-series')
const extend = require('xtend')

if (process.env.NODE_ENV === 'development') window.PouchDB = PouchDB

const remoteUrl = process.env.COUCHDB_URL + '/messages'
const remoteDB = new PouchDB(remoteUrl, { skipSetup: true })
const localDB = new PouchDB('messages')

module.exports = {
  state: {
    user: {},
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
    },
    setUser: (userCtx, state) => {
      return { user: userCtx }
    }
  },
  effects: {
    initialize: (data, state, send, done) => {
      remoteDB.getSession((err, body) => {
        if (err) {
          // Error with request
          return done(new Error('Error getting current session'))
        } else if (!body.userCtx.name) {
          // Not logged in
          const path = '/login'
          send('redirect', path, done)
        } else {
          // Logged in
          const databases = { local: localDB, remote: remoteDB }
          series([
            (cb) => send('setUser', body.userCtx, cb),
            (cb) => send('syncDatabases', databases, cb),
            (cb) => send('fetch', cb)
          ], done)
        }
      })
    },
    syncDatabases: (databases, state, send, done) => {
      PouchDB.sync(databases.local, databases.remote, {
        live: true,
        retry: true
      })
      .on('complete', function () {
        console.log('complete callback')
      })
      .once('paused', done)
      .once('error', done)
    },
    fetch: (data, state, send, done) => {
      localDB.allDocs({ include_docs: true, startkey: 'msg-' }, (err, result) => {
        if (err) return console.error('Error fetching docs', err)
        console.log(result)
        const messages = result.rows.map((row) => row.doc)
        send('receive', messages, done)
      })
    },
    outbound: (data, state, send, done) => {
      console.log('sending message: ' + data.body)
      data._id = `msg-${Date.now()}-${shortid.generate()}`
      data.direction = 'outbound'
      localDB.put(data, (err, response) => {
        if (err) return done(new Error('Error posting doc'))
        done() // if outbound is successful, new message is emitted & received via subscription
      })
    },
    addAndRedirect: (phone, state, send, done) => {
      series([
        (cb) => send('setAddingConversation', false, cb),
        (cb) => send('addConversation', phone, cb),
        (cb) => {
          const path = '/' + phone
          send('redirect', path, cb)
        }
      ])
    },
    login: (data, state, send, done) => {
      const { username, password } = data
      remoteDB.login(username, password, (err, body) => {
        if (err) return console.error('Login error', err)
        console.log(body)
        send('redirect', '/', done)
      })
    },
    logout: (data, state, send, done) => {
      remoteDB.logout((err) => {
        if (err) return done(new Error('Error logging out'))
        send('redirect', '/login', done)
      })
    },
    redirect: (path, state, send, done) => {
      window.history.pushState({}, null, path)
      send('location:setLocation', { location: path }, done)
    }
  },
  subscriptions: {
    receiveMessages: (send, done) => {
      localDB.changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', (change) => {
        if (change.id.substring(0, 4) !== 'msg-') return // filter out design docs
        console.log('change', change)
        send('receive', [change.doc], done)
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

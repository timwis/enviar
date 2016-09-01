const keyBy = require('lodash/keyby')
const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-authentication'))
const shortid = require('shortid')
const series = require('run-series')
const extend = require('xtend')
const Push = require('push.js')

if (process.env.NODE_ENV === 'development') window.PouchDB = PouchDB

const dbURL = process.env.COUCHDB_URL + '/messages'
const db = new PouchDB(dbURL, { skipSetup: true })

module.exports = {
  state: {
    user: {},
    messages: {},
    lastRead: {}, // { '+12151231234': '2016-08-22T00:01:02Z' }
    isAddingConversation: false
  },
  reducers: {
    receive: (messages, state) => {
      const keyedMessages = keyBy(messages, '_id')
      const newMessages = extend(state.messages, keyedMessages)
      return { messages: newMessages }
    },
    setAddingConversation: (isAddingConversation, state) => {
      return { isAddingConversation }
    },
    setUser: (userCtx, state) => {
      return { user: userCtx }
    },
    receiveLastRead: (newLastRead, state) => {
      // Actual updates are performed in the effect and passed to this reducer
      return { lastRead: newLastRead }
    }
  },
  effects: {
    initialize: (data, state, send, done) => {
      db.getSession((err, body) => {
        if (err) {
          // Error with request
          return done(new Error('Error getting current session'))
        } else if (!body.userCtx.name) {
          // Not logged in
          const path = '/login'
          send('redirect', path, done)
        } else {
          // Logged in
          series([
            (cb) => send('setUser', body.userCtx, cb),
            (cb) => send('fetch', cb)
          ], done)
        }
      })
    },
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
      data._id = `msg-${Date.now()}-${shortid.generate()}`
      data.direction = 'outbound'
      db.put(data, (err, response) => {
        if (err) return done(new Error('Error posting doc'))
        done() // if outbound is successful, new message is emitted & received via subscription
      })
    },
    addAndRedirect: (phone, state, send, done) => {
      series([
        (cb) => send('setAddingConversation', false, cb),
        (cb) => {
          const path = '/' + phone
          send('redirect', path, cb)
        }
      ])
    },
    login: (data, state, send, done) => {
      const { username, password } = data
      db.login(username, password, (err, body) => {
        if (err) return console.error('Login error', err)
        console.log(body)
        window.location.href = '/' // force refresh to call subscription again
      })
    },
    logout: (data, state, send, done) => {
      db.logout((err) => {
        if (err) return done(new Error('Error logging out'))
        send('redirect', '/login', done)
      })
    },
    redirect: (path, state, send, done) => {
      window.history.pushState({}, null, path)
      send('location:setLocation', { location: path }, done)
    },
    setLastRead: (data, state, send, done) => {
      const { phone, date } = data
      if (!state.lastRead[phone] || date > state.lastRead[phone]) {
        const newLastRead = extend(state.lastRead, { [phone]: date })
        try {
          window.localStorage.setItem('lastRead', JSON.stringify(newLastRead))
        } catch (e) {
          return done(new Error('Error saving last read timestamp to local storage'))
        }
        send('receiveLastRead', newLastRead, done)
      }
    },
    pushNotification: (data, state, send, done) => {
      // Only send for new messages
      if (!(data._id in state.messages)) {
        console.log('push', state)
        const path = '/' + data.from
        Push.create(data.from, {
          body: data.body,
          icon: 'https://i.imgur.com/w6dveCM.png',
          onClick: function () {
            window.focus()
            send('redirect', path, done)
            this.close()
          }
        })
      }
      done()
    }
  },
  subscriptions: {
    receiveMessages: (send, done) => {
      db.changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', (change) => {
        if (change.id.substring(0, 4) !== 'msg-') return // filter out design docs
        console.log('change', change)
        const operations = []
        if (change.doc.direction === 'inbound' && !document.hasFocus()) {
          operations.push((cb) => send('pushNotification', change.doc, cb))
        }
        operations.push((cb) => send('receive', [change.doc], cb))
        series(operations, done)
      })
    },
    getCachedLastRead: (send, done) => {
      try {
        const lastReadString = window.localStorage.getItem('lastRead')
        if (lastReadString) {
          const lastReadObject = JSON.parse(lastReadString)
          send('receiveLastRead', lastReadObject, done)
        }
      } catch (e) {
        // noop
      }
    }
  }
}

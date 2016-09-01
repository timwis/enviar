const keyBy = require('lodash/keyby')
const shortid = require('shortid')
const series = require('run-series')
const extend = require('xtend')

module.exports = (db) => ({
  namespace: 'convos',
  state: {
    messages: {},
    lastRead: {}, // { '+12151231234': '2016-08-22T00:01:02Z' }
    isAdding: false
  },
  reducers: {
    upsert: (messages, state) => {
      const keyedMessages = keyBy(messages, '_id')
      const newMessages = extend(state.messages, keyedMessages)
      return { messages: newMessages }
    },
    setAdding: (isAdding, state) => {
      return { isAdding }
    },
    setLastRead: (newLastRead, state) => {
      // Actual updates are performed in the effect and passed to this reducer
      return { lastRead: newLastRead }
    }
  },
  effects: {
    fetch: (data, state, send, done) => {
      db.allDocs({ include_docs: true, startkey: 'msg-' }, (err, result) => {
        if (err) return console.error('Error fetching docs', err)
        console.log(result)
        const messages = result.rows.map((row) => row.doc)
        send('convos:upsert', messages, done)
      })
    },
    sendOutbound: (data, state, send, done) => {
      console.log('sending message: ' + data.body)
      data._id = `msg-${Date.now()}-${shortid.generate()}`
      data.direction = 'outbound'
      db.put(data, (err, response) => {
        if (err) return done(new Error('Error posting doc'))
        done() // if outbound is successful, new message is emitted & received via subscription
      })
    },
    addConversation: (phone, state, send, done) => {
      series([
        (cb) => send('convos:setAdding', false, cb),
        (cb) => {
          const path = '/' + phone
          send('redirect', path, cb)
        }
      ])
    },
    saveLastRead: (data, state, send, done) => {
      const { phone, date } = data
      if (!state.lastRead[phone] || date > state.lastRead[phone]) {
        const newLastRead = extend(state.lastRead, { [phone]: date })
        try {
          window.localStorage.setItem('lastRead', JSON.stringify(newLastRead))
        } catch (e) {
          return done(new Error('Error saving last read timestamp to local storage'))
        }
        send('convos:setLastRead', newLastRead, done)
      }
    }
  },
  subscriptions: {
    receiveInbound: (send, done) => {
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
        operations.push((cb) => send('convos:upsert', [change.doc], cb))
        series(operations, done)
      })
    },
    getCachedLastRead: (send, done) => {
      try {
        const lastReadString = window.localStorage.getItem('lastRead')
        if (lastReadString) {
          const lastReadObject = JSON.parse(lastReadString)
          send('convos:setLastRead', lastReadObject, done)
        }
      } catch (e) {
        // noop
      }
    }
  }
})

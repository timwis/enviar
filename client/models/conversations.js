const http = require('choo/http')
const groupBy = require('lodash/groupby')
const keyBy = require('lodash/keyby')
const merge = require('lodash/merge')
const cloneDeep = require('lodash/clonedeep')
const extend = require('xtend')
const io = require('socket.io-client')

module.exports = {
  state: {
    conversations: {}
  },
  reducers: {
    receive: (messages, state) => {
      const newConversations = createIndexes(messages)
      const oldConversations = cloneDeep(state.conversations) // because merge mutates
      const mergedConversations = merge(oldConversations, newConversations)
      return { conversations: mergedConversations }
    }
  },
  effects: {
    fetch: (data, state, send, done) => {
      http('/api/messages', { json: true }, (err, response, body) => {
        if (err || response.statusCode !== 200) return done(new Error('Bad request'))
        send('receive', body, done)
      })
    },
    outbound: (data, state, send, done) => {
      console.log('sending message: ' + data.body)
      http.post('/api/outbound', { json: data }, (err, response) => {
        if (err || response.statusCode !== 200) return done(new Error('Bad request'))
        done() // if outbound is successful, new message is emitted & received via subscription
      })
    }
  },
  subscriptions: {
    receiveMessages: (send, done) => {
      const socket = io()
      socket.on('message', (data) => {
        console.log('message received', data)
        send('receive', [data], done)
      })
    }
  }
}

function createIndexes (messages) {
  const convosByPhone = groupBy(messages, (msg) => msg.direction === 'inbound' ? msg.from : msg.to)
  const convosByPhoneByID = {}
  for (let phone in convosByPhone) {
    convosByPhoneByID[phone] = keyBy(convosByPhone[phone], 'id')
  }
  return convosByPhoneByID
}

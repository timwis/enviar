const http = require('choo/http')
const groupBy = require('lodash/groupby')
const keyBy = require('lodash/keyby')
const merge = require('lodash/merge')
const extend = require('xtend')
const io = require('socket.io-client')

const endpoint = 'http://localhost:3000'
const socket = io(endpoint)

module.exports = {
  state: {
    conversations: {}
  },
  reducers: {
    receive: (messages, state) => {
      const newConversations = createIndexes(messages)
      const mergedConversations = merge(state.conversations, newConversations)
      return { conversations: mergedConversations }
    }
  },
  effects: {
    fetch: (data, state, send, done) => {
      http(endpoint, { json: true }, (err, response, body) => {
        if (err || response.statusCode !== 200) return done(new Error('Bad request'))
        send('receive', body, done)
      })
    },
    outbound: (data, state, send, done) => {
      console.log('sending message: ' + data.body)
      // socket.emit('outbound', data)
      http.post(endpoint + '/outbound', { json: data }, (err, response) => {
        if (err || response.statusCode !== 200) return done(new Error('Bad request'))
        done() // if outbound is successful, new message is emitted & received via subscription
      })
    }
  },
  subscriptions: [
    (send, done) => {
      socket.on('connect', () => console.log('connected'))
      socket.on('message', (data) => {
        console.log('message received', data)
        send('receive', [data], done)
      })
    }
  ]
}

function createIndexes (messages) {
  const convosByPhone = groupBy(messages, (msg) => msg.direction === 'inbound' ? msg.from : msg.to)
  const convosByPhoneByID = {}
  for (let phone in convosByPhone) {
    convosByPhoneByID[phone] = keyBy(convosByPhone[phone], 'id')
  }
  return convosByPhoneByID
}

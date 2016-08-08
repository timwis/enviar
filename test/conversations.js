const test = require('ava')
const sortBy = require('lodash/sortby')
require('jsdom-global')()

const model = require('../client/models/conversations')
const chat = require('../client/pages/chat')
const messagesFixture = require('../fixtures/formatted/messages.json')
const samplePhone = '+17034524023'

test('reducers : receive : group by convo and message id', (t) => {
  const state = model.reducers.receive(messagesFixture, {})
  const keys = Object.keys(state.conversations)
  t.is(keys.length, 8, 'list has correct number of convos')

  const convo = state.conversations[samplePhone]
  const convoKeys = Object.keys(convo)
  t.is(convoKeys.length, 4, 'convo has correct number of messages')
})

test('reducers : receive : new convo merged into existing list', (t) => {
  const newPhone = '+11234567'
  const state = model.reducers.receive(messagesFixture, {})
  const numConvosBefore = Object.keys(state.conversations).length

  const newMsg = {
    id: '1234',
    date: (new Date()).toISOString(),
    from: newPhone,
    body: 'Hello, world',
    direction: 'inbound'
  }

  const newState = model.reducers.receive([newMsg], state)
  const numConvosAfter = Object.keys(newState.conversations).length
  const numMessages = Object.keys(newState.conversations[newPhone]).length

  t.is(numConvosAfter, numConvosBefore + 1, 'one more convo')
  t.is(numMessages, 1, 'one message')
})

test('reducers : receive : new message merged into existing list', (t) => {
  const state = model.reducers.receive(messagesFixture, {})
  const numConvosBefore = Object.keys(state.conversations).length
  const numMessagesBefore = Object.keys(state.conversations[samplePhone]).length

  const newMsg = {
    id: '1234',
    date: (new Date()).toISOString(),
    from: samplePhone,
    body: 'Hello, world',
    direction: 'inbound'
  }

  const newState = model.reducers.receive([newMsg], state)
  const numConvosAfter = Object.keys(newState.conversations).length
  const numMessagesAfter = Object.keys(newState.conversations[samplePhone]).length

  t.is(numConvosAfter, numConvosBefore, 'same number of convos')
  t.is(numMessagesAfter, numMessagesBefore + 1, 'one more message')
})

test('reducers : receive : sort convo list', (t) => {
  const state = model.reducers.receive(messagesFixture, {})
  state.params = { phone: samplePhone }
  const send = () => {}
  const view = chat(state, {}, send)

  const convos = view.querySelector('#conversations').children
  t.is(convos.length, 8, 'list has correct number of convos')

  const firstMsg = sortBy(messagesFixture, 'date').reverse()[0]
  const firstConvo = convos[0].querySelector('a').textContent.trim()
  t.true(firstConvo === firstMsg.to || firstConvo === firstMsg.from, 'first convo is most recent')
})

test('reducers : receive : sort messages list', (t) => {
  const state = model.reducers.receive(messagesFixture, {})
  state.params = { phone: samplePhone }
  const send = () => {}
  const view = chat(state, {}, send)

  const uiMessages = view.querySelector('#messages').children
  const latestUIMessage = uiMessages[uiMessages.length - 1]
  t.is(uiMessages.length, 4, 'list has correct number of convos')

  const relevantFixtures = messagesFixture
    .filter((msg) => msg.from === samplePhone || msg.to === samplePhone)
  const latestRelevantFixture = sortBy(relevantFixtures, 'date').reverse()[0]

  const latestUIMessageBody = latestUIMessage.querySelector('.content p').textContent.trim()
  const latestFixtureBody = latestRelevantFixture.body
  t.is(latestUIMessageBody, latestFixtureBody)
})

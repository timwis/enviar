const test = require('ava')
const sortBy = require('lodash/sortby')
require('jsdom-global')()

const model = require('../client/models/conversations')
const chat = require('../client/pages/chat')
const messagesFixture = require('../fixtures/formatted/messages.json')
const samplePhone = '+17034524023'

test('reducers : receive : group by message id', (t) => {
  const state = model.reducers.receive(messagesFixture, {})
  const keys = Object.keys(state.messages)
  t.is(keys.length, 50, 'messages has correct number of keys')
})

test('pages : chat : group messages by conversation', (t) => {
  const state = model.reducers.receive(messagesFixture, {})
  const send = () => {}
  const view = chat(state, {}, send)

  const convoLinks = view.querySelector('#conversations').children
  t.is(convoLinks.length, 8, 'correct number of conversation links')
})

test('pages : chat : show active conversation messages', (t) => {
  const state = model.reducers.receive(messagesFixture, {})
  state.params = { phone: samplePhone }
  const send = () => {}
  const view = chat(state, {}, send)

  const messageItems = view.querySelector('#messages').children
  t.is(messageItems.length, 4, 'correct number of messages')
})

test('pages : chat : new message merged into existing list', (t) => {
  const stateBefore = model.reducers.receive(messagesFixture, {})
  stateBefore.params = { phone: samplePhone }
  const send = () => {}
  const viewBefore = chat(stateBefore, {}, send)

  const numConvosBefore = viewBefore.querySelector('#conversations').children.length
  const numMessagesBefore = viewBefore.querySelector('#messages').children.length

  const newMsg = {
    _id: '1234',
    date: (new Date()).toISOString(),
    from: samplePhone,
    body: 'Hello, world',
    direction: 'inbound'
  }

  const stateAfter = model.reducers.receive([newMsg], stateBefore)
  stateAfter.params = { phone: samplePhone }
  const viewAfter = chat(stateAfter, {}, send)
  const numConvosAfter = viewAfter.querySelector('#conversations').children.length
  const numMessagesAfter = viewAfter.querySelector('#messages').children.length

  t.is(numConvosAfter, numConvosBefore, 'same number of convos')
  t.is(numMessagesAfter, numMessagesBefore + 1, 'one more message')
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
  t.is(latestUIMessageBody, latestFixtureBody, 'last message is most recent')
})

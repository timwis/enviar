const test = require('ava')
const extend = require('xtend')
const sortBy = require('lodash/sortby')
require('jsdom-global')()

const model = require('../client/models/convos')()
const Layout = require('../client/views/layout')
const Chat = require('../client/views/chat')
const View = Layout(Chat)
const messagesFixture = require('./fixtures/formatted/messages.json')
const samplePhone = '+17034524023'

function generateState (messages, prev = {}) {
  return {
    convos: extend(model.state, model.reducers.upsert(messages, prev)),
    user: {}
  }
}

test('reducers : upsert : group by message id', (t) => {
  const state = generateState(messagesFixture)
  const keys = Object.keys(state.convos.messages)
  t.is(keys.length, 50, 'messages has correct number of keys')
})

test('pages : chat : group messages by conversation', (t) => {
  const state = generateState(messagesFixture)
  const send = () => {}
  const view = View(state, {}, send)

  const convoLinks = view.querySelector('#conversations').children
  t.is(convoLinks.length, 8, 'correct number of conversation links')
})

test('pages : chat : show active conversation messages', (t) => {
  const state = generateState(messagesFixture)
  state.params = { phone: samplePhone }
  const send = () => {}
  const view = View(state, {}, send)

  const messageItems = view.querySelector('#messages').children
  t.is(messageItems.length, 4, 'correct number of messages')
})

test('pages : chat : new message merged into existing list', (t) => {
  const stateBefore = generateState(messagesFixture)
  stateBefore.params = { phone: samplePhone }
  const send = () => {}
  const viewBefore = View(stateBefore, {}, send)

  const numConvosBefore = viewBefore.querySelector('#conversations').children.length
  const numMessagesBefore = viewBefore.querySelector('#messages').children.length

  const newMsg = {
    _id: '1234',
    date: (new Date()).toISOString(),
    from: samplePhone,
    body: 'Hello, world',
    direction: 'inbound'
  }

  const stateAfter = generateState([newMsg], stateBefore.convos)
  stateAfter.params = { phone: samplePhone }
  const viewAfter = View(stateAfter, {}, send)
  const numConvosAfter = viewAfter.querySelector('#conversations').children.length
  const numMessagesAfter = viewAfter.querySelector('#messages').children.length

  t.is(numConvosAfter, numConvosBefore, 'same number of convos')
  t.is(numMessagesAfter, numMessagesBefore + 1, 'one more message')
})

test('pages : chat : sort messages list', (t) => {
  const state = generateState(messagesFixture)
  state.params = { phone: samplePhone }
  const send = () => {}
  const view = View(state, {}, send)

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

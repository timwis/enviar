const html = require('choo/html')
const css = require('sheetify')
const values = require('lodash/values')
const sortBy = require('lodash/sortby')
const groupBy = require('lodash/groupby')

const ConversationList = require('../components/conversation-list')
const LogoArea = require('../components/logo-area')
const Messages = require('../components/messages')
const Compose = require('../components/compose')
const { formatPhone, validatePhone } = require('../util')

const title = process.env.APP_TITLE || require('../../package.json').name

const prefix = css`
  :host {
    height: 100%;
    display: flex;
  }
  .left {
    width: 200px;
    overflow-y: auto;
    background-color: #2F4550;
  }
  .right {
    height: 100%;
    flex: 1 auto;
    display: flex;
    flex-direction: column;
  }
  .messages {
    flex: 1 auto;
    display: flex;
    flex-direction: column-reverse;
    background-color: #F4F4F9;
    overflow-y: auto;
  }
  .header {
    font-size: 150%;
    padding: 5px;
    background-color: #F4F4F9;
    border-bottom: 1px black solid;
  }
  .compose {
    height: 75px;
    background-color: #F4F4F9;
  }
`

module.exports = (state, prev, send) => {
  let messages
  const isAdding = state.convos.isAdding
  const activePhone = state.params && state.params.phone
  const messagesArray = values(state.convos.messages)
  const conversations = groupBy(messagesArray, (msg) => msg.direction === 'inbound' ? msg.from : msg.to)
  const phones = calculateUnreadCounts(conversations, state.convos.lastRead)
  if (activePhone && conversations[activePhone]) {
    const activeConversation = sortBy(conversations[activePhone], 'date')
    messages = Messages(activePhone, activeConversation)
    setLastRead(activePhone, activeConversation, state.convos.lastRead)
  }

  return html`
    <div onload=${() => send('initialize')} class=${prefix}>
      <div class="left">
        ${LogoArea(title, state.user, onLogout)}
        ${ConversationList({ phones, activePhone, isAdding, onClickAdd, onSubmitAdd })}
      </div>
      <div class="right">
        <div class="header">
          ${activePhone ? formatPhone(activePhone) : ''}
        </div>
        <div class="messages">
          ${messages}
        </div>
        <div class="compose">
          ${Compose(onCompose)}
        </div>
      </div>
    </div>`

  function onCompose (data) {
    data.to = activePhone
    send('convos:sendOutbound', data)
  }

  function onClickAdd () {
    send('setAddingConversation', true)
  }

  function onSubmitAdd (phone) {
    const validatedPhone = validatePhone(phone)
    if (validatedPhone) {
      send('convos:addConversation', validatedPhone)
      return true
    } else {
      console.log('Invalid phone number')
      return false
    }
  }

  function onLogout () {
    send('user:logout')
  }

  // Calculate number of unread messages for each conversation
  // [ { label: '+12151231234', unread: 2 } ]
  function calculateUnreadCounts (conversations, lastRead) {
    const phones = []
    for (let phone in conversations) {
      const unread = lastRead[phone]
        ? conversations[phone].filter((msg) => msg.date > lastRead[phone]).length
        : conversations[phone].length
      phones.push({ label: phone, unread })
    }
    return phones
  }

  // Check if active conversation's latest message is newer than
  // the last "read" message date. If so, mark it as the latest "read"
  // message date.
  function setLastRead (phone, messages, lastRead) {
    const lastMessage = messages.length && messages[messages.length - 1]
    if (lastMessage && (!lastRead[phone] || lastRead[phone] < lastMessage.date)) {
      send('convos:saveLastRead', { phone, date: lastMessage.date })
    }
  }
}

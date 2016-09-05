const html = require('choo/html')
const css = require('sheetify')
const compose = require('lodash/fp/compose')
const values = require('lodash/fp/values')
const sortBy = require('lodash/fp/sortBy')
const filter = require('lodash/fp/filter')

const Messages = require('../components/messages')
const Compose = require('../components/compose')
const { formatPhone } = require('../util')

const prefix = css`
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
  const activePhone = state.params && state.params.phone
  const conversation = getConversation(state.convos.messages, activePhone)
  const messages = Messages(activePhone, conversation)
  setLastRead(activePhone, conversation, state.convos.lastRead)

  return html`
    <div class=${prefix}>
      <div class="header">
        ${formatPhone(activePhone || '')}
      </div>
      <div class="messages">
        ${messages}
      </div>
      <div class="compose">
        ${Compose(onCompose)}
      </div>
    </div>`

  function getConversation (messages, phone) {
    return compose(
      values,
      filter((msg) => msg.from === phone || msg.to === phone),
      sortBy('date')
    )(messages)
  }

  function onCompose (data) {
    data.to = activePhone
    send('convos:sendOutbound', data)
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

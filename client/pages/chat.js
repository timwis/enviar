const html = require('choo/html')
const css = require('sheetify')
const values = require('lodash/values')
const sortBy = require('lodash/sortby')

const ConversationList = require('../components/conversation-list')
const Messages = require('../components/messages')
const Compose = require('../components/compose')
const formatPhone = require('../util').formatPhone

const prefix = css`
  :host {
    height: 100%;
    display: flex;
  }
  .left {
    width: 20%;
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
  const activePhone = state.params.phone
  let activeConversation, messages
  if (activePhone) {
    activeConversation = state.conversations[activePhone]
    if (activeConversation) {
      const sortedConversation = sortBy(values(activeConversation), 'date')
      messages = Messages(activePhone, sortedConversation)
    }
  }
  const phones = Object.keys(state.conversations)

  return html`
    <div onload=${() => send('fetch')} class=${prefix}>
      <div class="left">
        ${ConversationList(phones, activePhone)}
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
    send('outbound', data)
  }
}

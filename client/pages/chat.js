const html = require('choo/html')
const css = require('sheetify')
const values = require('lodash/values')
const sortBy = require('lodash/sortby')
const getFormData = require('get-form-data')

const ConversationList = require('../components/conversation-list')
const Messages = require('../components/messages')
const Compose = require('../components/compose')

const prefix = css`
  :host {
    height: 100%;
    display: flex;
  }
  .left {
    width: 20%;
    overflow-y: auto;
  }
  .right {
    height: 100%;
    flex: 1 auto;
    display: flex;
    flex-direction: column;
  }
  .messages {
    flex: 1 auto;
    background-color: #eee;
    overflow-y: auto;
  }
  .header {
    font-size: 150%;
    padding: 5px;
    background-color: #eee;
    border-bottom: 1px black solid;
  }
  .compose {
    height: 50px;
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

  // if (activePhone && (!prev.params || activePhone !== prev.params.phone)) {
  //   const scroller = document.querySelector('#messages')
  //   if (scroller) window.setTimeout(() => scroller.scrollTop = scroller.scrollHeight, 100)
  // }

  return html`
    <div onload=${() => send('fetch')} class=${prefix}>
      <div class="left">
        ${ConversationList(phones, activePhone)}
      </div>
      <div class="right">
        <div class="header">
          ${activePhone}
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
    data.To = activePhone
    send('outbound', data)
  }
}

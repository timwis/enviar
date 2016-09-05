const html = require('choo/html')
const values = require('lodash/values')
const groupBy = require('lodash/groupBy')

const ConversationList = require('../components/conversation-list')
const LogoArea = require('../components/logo-area')
const { validatePhone } = require('../util')

const title = process.env.APP_TITLE || require('../../package.json').name

module.exports = (state, prev, send) => {
  const isAdding = state.convos.isAdding
  const activePhone = state.params && state.params.phone
  const conversations = groupByConversation(state.convos.messages)
  const phones = calculateUnreadCounts(conversations, state.convos.lastRead)

  return html`
    <div>
      ${LogoArea(title, state.user)}
      ${ConversationList({ phones, activePhone, isAdding, onClickAdd, onSubmitAdd })}
    </div>`

  function groupByConversation (messages) {
    return groupBy(
      values(messages),
      (msg) => msg.direction === 'inbound' ? msg.from : msg.to
    )
  }

  // Calculate number of unread messages for each conversation
  // returns: [ { label: '+12151231234', unread: 2 } ]
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

  function onClickAdd () {
    send('convos:setAdding', true)
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
}

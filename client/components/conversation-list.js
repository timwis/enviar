const html = require('choo/html')
const css = require('sheetify')

const formatPhone = require('../util').formatPhone

css('purecss/build/menus')

const prefix = css`
  :host {
    position: relative;
  }
  .pure-menu-selected a,
  .pure-menu-link:hover,
  .pure-menu-link:focus {
    background-color: #F4F4F9;
    color: #000;
  }
  .pure-menu-link,
  .pure-menu-heading {
    color: #B8DBD9;
  }
  .new-conversation {
    position: absolute;
    right: 15px;
    top: 8px;
    color: #B8DBD9;
  }
`

module.exports = ({ phones, activePhone, isAdding, onClickAdd, onSubmitAdd }) => {
  return html`
  <div class="pure-menu ${prefix}">
    <span class="pure-menu-heading">Conversations</span>
    <a href="#" onclick=${clickAdd} class="new-conversation"><i class="fa fa-plus-square"></i></a>
    <ul id="conversations" class="pure-menu-list">
      ${isAdding ? addForm() : ''}
      ${phones.map(listItem)}
    </ul>
  </div>`

  function listItem (phone) {
    const classes = ['pure-menu-item']
    if (activePhone && activePhone === phone.label) {
      classes.push('pure-menu-selected')
    }

    return html`
      <li class=${classes.join(' ')}>
        <a href="/${phone.label}" class="pure-menu-link">
          ${formatPhone(phone.label)} ${phone.unread > 0 ? html`<small>(${phone.unread})</small>` : ''}
        </a>
      </li>`
  }

  function clickAdd (e) {
    if (onClickAdd) onClickAdd()
    e.preventDefault()
  }

  function addForm () {
    return html`
      <form class="pure-form" onsubmit=${submitAdd}>
        <input id="phone" type="text" class="input-reset" placeholder="Phone number">
      </form>`
  }

  function submitAdd (e) {
    const phone = e.target.querySelector('#phone')
    if (phone.value && onSubmitAdd) {
      if (onSubmitAdd(phone.value)) {
        // clear value if submit was valid/successful
        phone.value = ''
      }
    }
    e.preventDefault()
  }
}

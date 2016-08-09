const html = require('choo/html')
const css = require('sheetify')

const formatPhone = require('../util').formatPhone

css('purecss/build/menus')

const prefix = css`
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
`

module.exports = (phones, activePhone) => {
  return html`
  <div class="pure-menu ${prefix}">
    <span class="pure-menu-heading">Conversations</span>
    <ul id="conversations" class="pure-menu-list">
      ${phones.map(listItem)}
    </ul>
  </div>`

  function listItem(phone) {
    const classes = ['pure-menu-item']
    if (activePhone && activePhone === phone) {
      classes.push('pure-menu-selected')
    }

    return html`
      <li class=${classes.join(' ')}>
        <a href="/${phone}" class="pure-menu-link">
          ${formatPhone(phone)}
        </a>
      </li>`
  }
}

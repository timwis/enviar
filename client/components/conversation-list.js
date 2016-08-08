const html = require('choo/html')
const css = require('sheetify')

css('purecss/build/menus')

const prefix = css`
  .pure-menu-selected a {
    background-color: #eee;
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
          ${phone}
        </a>
      </li>`
  }
}

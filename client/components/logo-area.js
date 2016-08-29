const html = require('choo/html')
const css = require('sheetify')

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
  .pure-menu-heading {
    font-size: 150%;
    padding: 10px 15px 0 15px;
    text-transform: inherit;
  }`

module.exports = (title, user, onLogout) => {
  const logoutSuffix = user.name && `as ${user.name}`
  return html`
    <div class="pure-menu ${prefix}">
      <span class="pure-menu-heading">${title}</span>
      <ul class="pure-menu-list">
        <li class="pure-menu-item">
          <a href="#" class="pure-menu-link" onclick=${onClickLogout}>Logout ${logoutSuffix}</a>
        </li>
      </ul>
    </div>`

  function onClickLogout (e) {
    if (onLogout) onLogout()
    e.preventDefault()
  }
}

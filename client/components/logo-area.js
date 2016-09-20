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
  }
  .pure-menu-item a {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`

module.exports = (title, user = {}) => {
  const loginLogoutLink = user.name
    ? html`<a href="/account" class="pure-menu-link"><i class="fa fa-user"></i> ${user.name}</a>`
    : html`<a href="/login" class="pure-menu-link">Login</a>`

  return html`
    <div class="pure-menu ${prefix}">
      <span class="pure-menu-heading">${title}</span>
      <ul class="pure-menu-list">
        <li class="pure-menu-item">
          ${loginLogoutLink}
        </li>
      </ul>
    </div>`
}

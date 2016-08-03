const html = require('choo/html')
const timeago = require('timeago.js')()
const css = require('sheetify')

const prefix = css`
  ul {
    list-style: none;
    padding: 10px;
    background-color: #eee;
  }

  li {
    display: flex;
    margin: 10px 0;
  }

  li.outbound {
    justify-content: flex-end;
    align-items: flex-end;
  }

  div.content {
    padding: 10px;
    border-radius: 2px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  li.outbound div.content {
    background-color: #b4def3;
  }

  li.inbound div.content {
    background-color: #fff;
  }

  abbr {
    color: #616161;
  }
`

module.exports = (phone, messages, onSendMsg) => {
  const tree = html`
    <section class=${prefix}>
      <ul id="messages" onload=${scrollToBottom}>
        ${messages.map((msg) => html`
          <li class=${msg.direction === 'inbound' ? 'inbound' : 'outbound'}>
            <div class="content">
              <p>${msg.body}</p>
              ${msg.date ? html`<abbr title=${msg.date}>${timeago.format(msg.date)}</abbr>` : ''}
            </div>
          </li>`)}
      </ul>
    </section>`

  return tree

  function scrollToBottom (el) {
    el.scrollTop = el.scrollHeight
  }
}

const html = require('choo/html')
const css = require('sheetify')

const prefix = css`
  :host {
    height: 75%;
    margin: 10px;
  }
  #body {
    width: 100%;
    line-height: 2;
  }
`

module.exports = (cb) => {
  return html`
    <form onsubmit=${onSubmit} class="${prefix} pure-form">
      <input id="body" type="text" class="input-reset" placeholder="Send a message...">
    </form>`

  function onSubmit (e) {
    const body = e.target.querySelector('#body')
    if (body.value && cb) {
      const formData = { body: body.value }
      cb(formData)
      body.value = ''
    }
    e.preventDefault()
  }
}

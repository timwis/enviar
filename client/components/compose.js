const html = require('choo/html')
const getFormData = require('get-form-data')
const css = require('sheetify')

css('purecss/build/forms')

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
    const formData = getFormData(e.target)
    if (cb) cb(formData)
    e.preventDefault()
  }
}

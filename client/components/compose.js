const html = require('choo/html')
const getFormData = require('get-form-data')
const css = require('sheetify')

const prefix = css`
  :host {
    height: 100%;
    padding: 0;
    margin: 0;
  }
  #body {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }
`

module.exports = (cb) => {
  return html`
    <form onsubmit=${onSubmit} class="${prefix} pure-form">
      <input id="body" type="text" class="input-reset">
    </form>`
  
  function onSubmit (e) {
    const formData = getFormData(e.target)
    if (cb) cb(formData)
    e.preventDefault()
  }
}

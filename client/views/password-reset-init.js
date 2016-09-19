const html = require('choo/html')
const css = require('sheetify')

const prefix = css`
  :host {
    height: 100%;
    background-color: #F4F4F9;
    padding: 0 15px;
  }
`

module.exports = (state, prev, send) => {
  return html`
    <section class=${prefix}>
      <h1>Forgot password</h1>
      <form class="pure-form pure-form-stacked" onsubmit=${onSubmit}>
        <label>
          Email
          <input type="email" name="email" placeholder="john@doe.com">
        </label>

        <button type="submit" class="pure-button pure-button-primary">Reset password</button>
      </form>
    </section>`

  function onSubmit (e) {
    const input = e.target.querySelector('[name=email]')
    const email = input.value
    send('user:resetPasswordInit', { email })
    input.value = ''
    e.preventDefault()
  }
}

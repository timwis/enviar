const html = require('choo/html')
const getFormData = require('get-form-data')
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
      <h2>Login</h2>
      <form class="pure-form pure-form-stacked" onsubmit=${onSubmit}>
        <label>
          Email
          <input type="text" name="email">
        </label>

        <label>
          Password
          <input type="password" name="password">
        </label>

        <button type="submit" class="pure-button pure-button-primary">Login</button>
        <a href="/reset-password">Forgot password</a>
      </form>
    </section>`

  function onSubmit (e) {
    const formData = getFormData(e.target)
    send('user:login', formData)
    e.preventDefault()
  }
}

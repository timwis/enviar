const html = require('choo/html')
const css = require('sheetify')
const getFormData = require('get-form-data')

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
      <h1>Reset password</h1>
      <form class="pure-form pure-form-stacked" onsubmit=${onSubmit}>
        <label>
          New password
          <input type="password" name="password">
        </label>

        <label>
          Confirm new password
          <input type="password" name="confirm">
        </label>

        <button type="submit" class="pure-button pure-button-primary">Reset password</button>

        ${state.ui.resetPasswordConfirmSubmitted
          ? html`<div class="alert">Your password has been reset. Please <a href="/login">Login</a>.</div>`
          : ''}
      </form>
    </section>`

  function onSubmit (e) {
    const formData = getFormData(e.target)
    if (formData.password === formData.confirm) {
      formData.token = state.params.token
      send('user:resetPasswordConfirm', formData)

      // reset inputs
      Array.from(document.querySelectorAll('input')).forEach((el) => el.value = '')
    }
    e.preventDefault()
  }
}

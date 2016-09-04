const html = require('choo/html')
const getFormData = require('get-form-data')
const css = require('sheetify')

const prefix = css`
  :host {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #F4F4F9;
  }
`

module.exports = (state, prev, send) => {
  return html`
    <section class=${prefix}>
      <form class="pure-form pure-form-stacked" onsubmit=${onSubmit}>
        <label>
          New Password
          <input type="password" name="password">
        </label>

        <label>
          Confirm
          <input type="password" name="confirm">
        </label>

        <button type="submit" class="pure-button pure-button-primary">Change Password</button>
      </form>
    </section>`

  function onSubmit (e) {
    const formData = getFormData(e.target)
    if (formData.password === formData.confirm) {
      send('user:changePassword', formData)
    } else {
      console.error('Passwords do not match')
    }
    e.preventDefault()
  }
}

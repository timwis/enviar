const html = require('choo/html')
const getFormData = require('get-form-data')
const css = require('sheetify')

const prefix = css`
  :host {
    height: 100%;
    background-color: #F4F4F9;
    padding: 0 15px;
  }
  #logout {
    width: 200px;
  }
`

module.exports = (state, prev, send) => {
  return html`
    <section class=${prefix}>
      <h2>Logout</h2>
      <button onclick=${onClickLogout} class="pure-button pure-button-primary" id="logout">
        <i class="fa fa-sign-out"></i>
        Logout as ${state.user.name}
      </button>

      <h2>Change password</h2>
      <form class="pure-form pure-form-stacked" onsubmit=${onChangePassword}>
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

      <h2>Change email</h2>
      <form class="pure-form pure-form-stacked" onsubmit=${onChangeEmail}>
        <label>
          New Email
          <input type="email" name="email">
        </label>

        <button type="submit" class="pure-button pure-button-primary">Change Email</button>

        ${state.ui.changeEmailSubmitted
          ? html`<div class="alert">Your email has been changed.</div>`
          : ''}
      </form>
    </section>`

  function onChangePassword (e) {
    const formData = getFormData(e.target)
    if (formData.password === formData.confirm) {
      send('user:changePassword', formData)
    } else {
      console.error('Passwords do not match')
    }
    e.preventDefault()
  }

  function onChangeEmail (e) {
    const input = e.target.querySelector('[name=email]')
    const email = input.value
    if (email) {
      send('user:changeEmail', {email})
      input.value = ''
    }
    e.preventDefault()
  }

  function onClickLogout (e) {
    send('user:logout')
    e.preventDefault()
  }
}

const html = require('choo/html')
const getFormData = require('get-form-data')
const css = require('sheetify')

const { hasAdminAccess } = require('../util')

const prefix = css`
  :host {
    height: 100%;
    background-color: #F4F4F9;
    padding: 0 15px;
  }
  #logout {
    width: 200px;
  }
  #current-login {
    margin-top: 0;
  }
`

module.exports = (state, prev, send) => {
  return html`
    <section class=${prefix}>
      <h2>Logout</h2>
      <p id="current-login">Logged in as ${state.user.name}</p>
      <button onclick=${onClickLogout} class="pure-button pure-button-primary" id="logout">
        <i class="fa fa-sign-out"></i>
        Logout
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

      ${hasAdminAccess(state.user)
        ? html`
          <div>
            <h2>Invite new user</h2>
            <form class="pure-form pure-form-stacked" onsubmit=${onInvite}>
              <label>
                Email
                <input type="text" name="email">
              </label>

              <button type="submit" class="pure-button pure-button-primary">Invite</button>

              ${state.ui.inviteSubmitted
                ? html`<div class="alert">An email has been sent to the address you entered with futher instructions.</div>`
                : ''}
            </form>
          </div>`
        : ''}

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

  function onInvite (e) {
    const input = e.target.querySelector('[name=email]')
    const email = input.value
    if (email) {
      send('user:invite', { email })
      input.value = ''
    }
    e.preventDefault()
  }

  function onClickLogout (e) {
    send('user:logout')
    e.preventDefault()
  }
}

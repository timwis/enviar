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

  function onClickLogout (e) {
    send('user:logout')
    e.preventDefault()
  }
}

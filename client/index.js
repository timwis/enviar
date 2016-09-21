const choo = require('choo')
const css = require('sheetify')
const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-authentication'))

const Layout = require('./views/layout')
const RequireAuth = require('./views/require-auth')
const Login = require('./views/login')
const Chat = require('./views/chat')
const Account = require('./views/account')
const ResetPasswordInit = require('./views/reset-password-init')
const ResetPasswordConfirm = require('./views/reset-password-confirm')

css('purecss/build/base')
css('purecss/build/forms')
css('purecss/build/buttons')
require('insert-css')(`
  @import url(https://fonts.googleapis.com/css?family=Roboto);
  @import url(https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css);
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: 'Roboto', sans-serif;
    overflow: hidden;
  }
`)

const app = choo()

if (process.env.NODE_ENV === 'development') {
  const log = require('choo-log')
  app.use(log())
}

const dbURL = process.env.COUCHDB_HOST + '/enviar'
const db = new PouchDB(dbURL, { skipSetup: true })

// Check for user session and pass it to user model as initial state
// Not very chooey but no other option panned out.
db.getSession((err, body) => {
  const initialUserState = err ? {} : body.userCtx
  app.model(require('./models/user')(db, initialUserState))
  app.model(require('./models/app')(db))
  app.model(require('./models/convos')(db, initialUserState))
  app.model(require('./models/ui'))

  app.router((route) => [
    route('/', RequireAuth(Layout())),
    route('/:phone', RequireAuth(Layout(Chat))),
    route('/login', Layout(Login)),
    route('/account', RequireAuth(Layout(Account))),
    route('/reset-password', Layout(ResetPasswordInit), [
      route('/:token', Layout(ResetPasswordConfirm))
    ])
  ])

  const tree = app.start()
  document.body.appendChild(tree)
})

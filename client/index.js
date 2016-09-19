const choo = require('choo')
const css = require('sheetify')
const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-authentication'))

const Layout = require('./views/layout')
const RequireAuth = require('./views/require-auth')
const Login = require('./views/login')
const Chat = require('./views/chat')
const Account = require('./views/account')

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

db.getSession((err, body) => {
  const initialUserState = err ? {} : body.userCtx
  app.model(require('./models/user')(db, initialUserState))
  app.model(require('./models/app')(db))
  app.model(require('./models/convos')(db))

  app.router((route) => [
    route('/', RequireAuth(Layout())),
    route('/:phone', RequireAuth(Layout(Chat))),
    route('/login', Layout(Login)),
    route('/account', RequireAuth(Layout(Account)))
  ])

  const tree = app.start()
  document.body.appendChild(tree)
})

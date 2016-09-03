const choo = require('choo')
const css = require('sheetify')
const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-authentication'))

const layout = require('./views/layout')
const login = require('./views/login')

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

  window.PouchDB = PouchDB
}

const dbURL = process.env.COUCHDB_URL + '/messages'
const db = new PouchDB(dbURL, { skipSetup: true })

app.model(require('./models/app')(db))
app.model(require('./models/user')(db))
app.model(require('./models/convos')(db))

app.router((route) => [
  route('/', layout),
  route('/:phone', layout),
  route('/login', login)
])

const tree = app.start()
document.body.appendChild(tree)

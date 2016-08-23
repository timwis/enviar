const choo = require('choo')
const css = require('sheetify')

const chat = require('./pages/chat')

css('purecss/build/base')
css('purecss/build/forms')
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

app.model(require('./models/conversations'))

app.router((route) => [
  route('/', chat),
  route('/:phone', chat)
])

const tree = app.start()
document.body.appendChild(tree)

const choo = require('choo')
const css = require('sheetify')
require('insert-css')(`
  @import url(https://fonts.googleapis.com/css?family=Roboto);
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: 'Roboto', sans-serif;
  }
`)

const chat = require('./pages/chat')

css('purecss/build/base')

const app = choo()

app.model(require('./models/conversations'))

app.router((route) => [
  route('/', chat),
  route('/:phone', chat)
])

const tree = app.start()
document.body.appendChild(tree)

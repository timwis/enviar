const choo = require('choo')
const css = require('sheetify')
require('insert-css')(`
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
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

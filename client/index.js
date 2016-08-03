const choo = require('choo')
const insertCSS = require('insert-css')
const css = require('sheetify')

const chat = require('./pages/chat')

css('purecss/build/base')

insertCSS(`
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
  }
`)

const app = choo()

app.model(require('./models/conversations'))

app.router((route) => [
  route('/', chat),
  route('/:phone', chat)
])

const tree = app.start()
document.body.appendChild(tree)

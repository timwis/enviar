require('dotenv').config({silent: true})
const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN
const phone = process.env.PHONE
const port = process.env.PORT || 3000

const client = require('twilio')(accountSid, authToken)
const koa = require('koa')
const route = require('koa-route')
const cors = require('kcors')
const socket = require('koa-socket')
const body = require('koa-body')
const fs = require('fs')

const formatData = require('./format-data')
const fixtures = {
  messages: require('./fixtures/messages.json'),
  outbound: require('./fixtures/outbound.json')
}

const app = koa()
const io = new socket()

io.attach(app)

app.use(cors())
app.use(body())
app.use(route.get('/', list))
app.use(route.post('/inbound', inbound))
app.use(route.post('/outbound', outbound))

function * list () {
  const params = Object.assign({}, this.query) // clone query
  try {
    // this.body = yield client.messages.get(params)
    this.body = fixtures.messages.messages.map(formatData.rest)
  } catch (e) {
    this.throw(e, e.status)
  }
}

function * inbound () {
  const formattedMessage = formatData.webhook(this.request.body)
  console.log(formattedMessage)
  io.broadcast('message', formattedMessage)
  this.status = 200
}

function * outbound () {
  const data = this.request.body
  data.From = phone
  console.dir(data)
  try {
    // const response = yield client.messages.post(data)
    const response = fixtures.outbound
    response.body = data.body
    response.to = data.To
    response.dateCreated = (new Date()).toISOString()

    const formattedResponse = formatData.rest(response)
    io.broadcast('message', formattedResponse)
    this.status = 200
  } catch (e) {
    this.throw(e, e.status)
  }
}

io.on('connection', ({socket}) => {
  console.log('new connection')
  socket.on('disconnect', () => console.log('disconnected'))
})

app.listen(port)
console.log('listening on port', port)

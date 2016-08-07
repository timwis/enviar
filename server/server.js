require('dotenv').config({silent: true})
const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN
const phone = process.env.PHONE
const port = process.env.PORT || 3000
const dev = process.env.NODE_ENV === 'development'

const http = require('http')
const serverRouter = require('server-router')
const bankai = require('bankai')
const browserify = require('browserify')
const fromString = require('from2-string')
const socketio = require('socket.io')
const formBody = require('body/form')
const jsonBody = require('body/json')
const client = dev
  ? require('./fixtures/twilio-stub')
  : require('twilio')(accountSid, authToken)

const formatData = require('./format-data')

const router = serverRouter()

const server = http.createServer(router)
  .listen(port, () => console.log('Listening on port ' + port))

io = socketio(server)
io.on('connection', (socket) => {
  console.log('new connection')
  socket.on('disconnect', () => console.log('disconnected'))
})

const html = bankai.html()
router.on('/', wrapHandler(html))

const css = bankai.css()
router.on('/bundle.css', wrapHandler(css))

const js = bankai.js(browserify, __dirname + '/client/index.js')
router.on('/bundle.js', wrapHandler(js))

router.on('/api/messages', function (req, res) {
  client.messages.get({}, (err, messages) => {
    if (err) return res.statusCode = 500
    const formattedMessages = messages.messages.map(formatData.rest)
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(formattedMessages))
  })
})

router.on('/api/inbound', {
  post: function (req, res) {
    formBody(req, {}, (err, body) => {
      if (err) return res.statusCode = 400

      const formattedMessage = formatData.webhook(body)
      io.emit('message', formattedMessage)
      res.end()
    })
  }
})

router.on('/api/outbound', {
  post: function (req, res) {
    jsonBody(req, res, (err, body) => {
      if (err) return res.statusCode = 400

      body.From = phone
      client.messages.post(body, (err, response) => {
        if (err) return res.statusCode = 500

        const formattedResponse = formatData.rest(response)
        io.emit('message', formattedResponse)
        res.end()
      })
    })
  }
})

function wrapHandler (handler) {
  return (req, res) => handler(req, res).pipe(res)
}

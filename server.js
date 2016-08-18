require('dotenv').config({silent: true})
const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN
const phone = process.env.PHONE
const port = process.env.PORT || 3000
const dev = process.env.NODE_ENV === 'development'
const title = process.env.TITLE || require('./package.json').name
const couchdb = process.env.COUCH_DB_URL

const http = require('http')
const serverRouter = require('server-router')
const bankai = require('bankai')
const browserify = require('browserify')
const nano = require('nano')(couchdb)
const formBody = require('body/form')
const client = dev
  ? require('./fixtures/twilio/stub')
  : require('twilio')(accountSid, authToken)

const formatData = require('./format-data')

/**
 * CouchDB pre-loading
 */
const messagesDB = nano.db.use('messages')
messagesDB.list({ limit: 1, include_docs: true, startkey: 'msg-' }, (err, body) => {
  if (err) return console.error(err)
  if (body.rows.length) {
    // fetch messages since body.rows[0].smsid
    console.log('most recent message', body.rows[0])
  } else {
    // fresh db - seed a few pages of messages
    console.log('no messages in db')
    client.messages.get({}, (err, messages) => {
      if (err) return console.error('Error fetching messages from twilio')
      const formattedMessages = messages.messages.map(formatData.fromTwilioRest)
      messagesDB.bulk({ docs: formattedMessages }, (err, body) => {
        if (err) return console.error('Error inserting messages into database', err)
        console.log(body)
      })
    })
  }
})

const feed = messagesDB.follow({ filter: 'messages/pending-outbound', include_docs: true })
feed.on('change', (change) => {
  console.log('change', change)
  const payload = formatData.toTwilioRest(change.doc)
  payload.From = phone
  client.messages.post(payload, (err, response) => {
    if (err) return console.error('Error sending message to provider')

    const formattedResponse = formatData.fromTwilioRest(response)
    // todo: update doc w/response
    formattedResponse._id = change.id
    formattedResponse._rev = change.doc._rev
    console.log('sent', formattedResponse)
    messagesDB.insert(formattedResponse, (err, body) => {
      if (err) return console.error('Error updating message in db', err)
      console.log(body)
    })
  })
})
feed.follow()

const router = serverRouter()

http.createServer(router).listen(port, () => console.log('Listening on port ' + port))

const html = bankai.html({ title })
router.on('/', wrapHandler(html))

const css = bankai.css()
router.on('/bundle.css', wrapHandler(css))

const js = bankai.js(browserify, __dirname + '/client/index.js', { transform: 'envify', debug: dev })
router.on('/bundle.js', wrapHandler(js))

router.on('/api/inbound', {
  post: function (req, res) {
    formBody(req, {}, (err, body) => {
      if (err) return res.statusCode = 400

      const formattedMessage = formatData.fromTwilioWebhook(body)
      messagesDB.insert(formattedMessage, (err, body) => {
        if (err) return console.error('Error inserting inbound message into db', err)
        console.log(body)
      })
      res.end()
    })
  }
})

function wrapHandler (handler) {
  return (req, res) => handler(req, res).pipe(res)
}

require('dotenv').config({silent: true})
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE = process.env.TWILIO_PHONE
const PORT = process.env.PORT || 3000
const DEV = process.env.NODE_ENV === 'development'
const APP_TITLE = process.env.APP_TITLE || require('../package.json').name
const COUCHDB_HOST = process.env.COUCHDB_HOST
const COUCHDB_USER = process.env.COUCHDB_USER
const COUCHDB_PASS = process.env.COUCHDB_PASS

const http = require('http')
const assert = require('assert')
const nano = require('nano')
const url = require('url')

const fetchMessages = require('./fetch-messages')
const staticRouter = require('./static-router')
const inboundRoute = require('./inbound-route')
const followOutbound = require('./follow-outbound')

// Setup twilio client (or stub)
let twilio
if (DEV) {
  twilio = require('../test/fixtures/twilio/stub')
} else {
  assert(TWILIO_ACCOUNT_SID, 'TWILIO_ACCOUNT_SID environment variable is not defined')
  assert(TWILIO_AUTH_TOKEN, 'TWILIO_AUTH_TOKEN environment variable is not defined')
  assert(TWILIO_PHONE, 'TWILIO_PHONE environment variable is not defined')
  twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
}

// Setup CouchDB
assert(COUCHDB_HOST, 'COUCHDB_HOST environment variable is not defined')
const authUrl = COUCHDB_USER ? addAuthToUrl(COUCHDB_HOST, COUCHDB_USER, COUCHDB_PASS) : COUCHDB_HOST
const db = nano(authUrl).use('enviar')
fetchMessages(db, twilio)
followOutbound(db, twilio, TWILIO_PHONE)

// Setup HTTP server
const router = staticRouter({ title: APP_TITLE, dev: DEV })
inboundRoute(router, db)
http.createServer(router).listen(PORT, () => console.log('Listening on port', PORT))

function addAuthToUrl (plainUrl, user, pass) {
  const urlObj = url.parse(plainUrl)
  urlObj.auth = user + ':' + pass
  return url.format(urlObj)
}

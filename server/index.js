'use strict'
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
const POSTMARK_SERVER_TOKEN = process.env.POSTMARK_SERVER_TOKEN

const http = require('http')
const assert = require('assert')
const nano = require('nano')
const serverRouter = require('server-router')
const bankai = require('bankai')
const browserify = require('browserify')
const path = require('path')
const jsonBody = require('body/json')
const formBody = require('body/form')

const fetchMessages = require('./fetch-messages')
const receiveInbound = require('./receive-inbound')
const followOutbound = require('./follow-outbound')
const initReset = require('./reset-password').initReset
const confirmReset = require('./reset-password').confirmReset
const addAuthToUrl = require('./util').addAuthToUrl
const parseBody = require('./util').parseBody
const pipeToResponse = require('./util').pipeToResponse

// Setup twilio and postmark client (or stubs)
let twilio, emailClient
if (DEV) {
  twilio = require('../test/helpers/twilio')
  const postmark = require('../test/helpers/postmark')
  emailClient = new postmark.Client()
} else {
  assert(TWILIO_ACCOUNT_SID, 'TWILIO_ACCOUNT_SID environment variable is not defined')
  assert(TWILIO_AUTH_TOKEN, 'TWILIO_AUTH_TOKEN environment variable is not defined')
  assert(TWILIO_PHONE, 'TWILIO_PHONE environment variable is not defined')
  twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

  assert(POSTMARK_SERVER_TOKEN, 'POSTMARK_SERVER_TOKEN environment variable is not defined')
  const postmark = require('postmark')
  emailClient = new postmark.Client(POSTMARK_SERVER_TOKEN)
}

// Setup CouchDB
assert(COUCHDB_HOST, 'COUCHDB_HOST environment variable is not defined')
const authUrl = COUCHDB_USER ? addAuthToUrl(COUCHDB_HOST, COUCHDB_USER, COUCHDB_PASS) : COUCHDB_HOST
const messagesDB = nano(authUrl).use('enviar')
const usersDB = nano(authUrl).use('_users')
fetchMessages(messagesDB, twilio)
followOutbound(messagesDB, twilio, TWILIO_PHONE)

// Setup HTTP server
const router = serverRouter()
const assets = bankai()

const htmlHandler = assets.html({ title: APP_TITLE, entry: '/bundle.js', css: '/bundle.css' })
router.on('/', pipeToResponse(htmlHandler))

const cssHandler = assets.css()
router.on('/bundle.css', pipeToResponse(cssHandler))

const jsPath = path.resolve(__dirname, '../client/index.js')
const jsHandler = assets.js(browserify, jsPath, { transform: 'envify', debug: DEV })
router.on('/bundle.js', pipeToResponse(jsHandler))

const receiveInboundHandler = receiveInbound(messagesDB)
router.on('/api/inbound', {
  post: parseBody(formBody, receiveInboundHandler)
})

const initResetHandler = initReset(usersDB, emailClient)
router.on('/api/reset-password-init', {
  post: parseBody(jsonBody, initResetHandler)
})

const confirmResetHandler = confirmReset(usersDB)
router.on('/api/reset-password-confirm', {
  post: parseBody(jsonBody, confirmResetHandler)
})

http.createServer(router).listen(PORT, () => console.log('Listening on port', PORT))

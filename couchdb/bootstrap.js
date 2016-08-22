require('dotenv').config({silent: true})
const COUCH_DB_URL = process.env.COUCH_DB_URL
const dbPath = COUCH_DB_URL + '/messages'

const assert = require('assert')
const push = require('couchdb-push')
const configure = require('couchdb-configure')
const ensure = require('couchdb-ensure')

assert(COUCH_DB_URL, 'COUCH_DB_URL environment variable is not defined')

ensure(dbPath, (err, resp) => {
  if (err) return console.error('Error creating database', err)

  const configPath = __dirname + '/_config.json'
  configure(COUCH_DB_URL, configPath, (err, resp) => {
    if (err) return console.error('Error configuring database', err)
    console.log(resp)
  })

  const messagesPath = __dirname + '/messages'
  push(dbPath, messagesPath, { index: true }, (err, resp) => {
    if (err) return console.error('Error creating design document', err)
    console.log(resp)
  })
})

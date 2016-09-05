require('dotenv').config({silent: true})
const COUCHDB_HOST = process.env.COUCHDB_HOST
const COUCHDB_USER = process.env.COUCHDB_USER
const COUCHDB_PASS = process.env.COUCHDB_PASS

const assert = require('assert')
const url = require('url')
const path = require('path')
const bootstrap = require('couchdb-bootstrap')

assert(COUCHDB_HOST, 'COUCHDB_HOST environment variable is not set')
const authUrl = COUCHDB_USER ? addAuthToUrl(COUCHDB_HOST, COUCHDB_USER, COUCHDB_PASS) : COUCHDB_HOST
const configUrl = path.join(__dirname, '/couchdb')

bootstrap(authUrl, configUrl, { index: true }, (err, body) => {
  if (err) {
    if (err.statusCode === 401) {
      console.error('Unauthorized. Make sure COUCHDB_USER and COUCHDB_PASS environment variables are set correctly')
    } else {
      console.error('Error bootstrapping database', err)
    }
    return process.exit(1)
  }
  console.log(body)
})

function addAuthToUrl (plainUrl, user, pass) {
  const urlObj = url.parse(plainUrl)
  urlObj.auth = user + ':' + pass
  return url.format(urlObj)
}

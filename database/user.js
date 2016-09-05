require('dotenv').config({silent: true})
const COUCHDB_URL = process.env.COUCHDB_URL
const COUCHDB_USER = process.env.COUCHDB_USER
const COUCHDB_PASS = process.env.COUCHDB_PASS

const assert = require('assert')
const url = require('url')
const nano = require('nano')
const meow = require('meow')

assert(COUCHDB_URL, 'COUCHDB_URL environment variable is not set')
const authUrl = COUCHDB_USER ? addAuthToUrl(COUCHDB_URL, COUCHDB_USER, COUCHDB_PASS) : COUCHDB_URL
const db = nano(authUrl).use('_users')

const cli = meow(`
  Usage
    $ npm run user -- <username> <password?>
`)

const [ username, password ] = cli.input
assert(username, 'No username provided')

const userId = 'org.couchdb.user:' + username
db.get(userId, (err, body) => {
  if (err) {
    console.log('User doesn\'t exist. Creating.')
    assert(password, 'No password provided')
    const userDoc = {
      name: username,
      password: password,
      roles: ['agent'],
      type: 'user',
      _id: userId
    }
    db.insert(userDoc, (err, body) => {
      if (err) return console.error('Error creating user')
      console.log(body)
    })
  } else {
    console.log('User exists. Updating.')
    const updates = {}
    if (password) updates.password = password
    if (!body.roles.length) updates.roles = ['agent']
    const updateDoc = Object.assign({}, body, updates)
    db.insert(updateDoc, (err, body) => {
      if (err) return console.error('Error updating user', err)
      console.log(body)
    })
  }
})

function addAuthToUrl (plainUrl, user, pass) {
  const urlObj = url.parse(plainUrl)
  urlObj.auth = user + ':' + pass
  return url.format(urlObj)
}

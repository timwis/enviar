require('dotenv').config({silent: true})
const couchdb = process.env.COUCH_DB_URL
const dbName = 'messages'

const push = require('couchdb-push')
const configure = require('couchdb-configure')

const couchPath = couchdb + '/' + dbName
console.log(couchPath)
push(couchPath, './.couchdb/messages', { index: true }, (err, resp) => {
  if (err) return console.error(err)
  console.log(resp)
})

configure(couchdb, './.couchdb/_config.json', (err, resp) => {
  if (err) return console.error(err)
  console.log(resp)
})

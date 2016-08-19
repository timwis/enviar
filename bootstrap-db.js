require('dotenv').config({silent: true})
const couchdb = process.env.COUCH_DB_URL
const dbName = 'messages'

const push = require('couchdb-push')
const configure = require('couchdb-configure')
const ensure = require('couchdb-ensure')

const couchPath = couchdb + '/' + dbName

ensure(couchPath, (err, resp) => {
  if (err) return console.error('Error creating database', err)

  configure(couchdb, './.couchdb/_config.json', (err, resp) => {
    if (err) return console.error('Error configuring database', err)
    console.log(resp)
  })

  push(couchPath, './.couchdb/messages', { index: true }, (err, resp) => {
    if (err) return console.error('Error creating design document', err)
    console.log(resp)
  })
})

require('dotenv').config({silent: true})
const couchdb = process.env.COUCH_DB_URL
const dbName = 'messages'

const push = require('couchdb-push')
// const nano = require('nano')(couchdb)

// nano.db.get(dbName, (err, body) => {
//   if (err) {
//     nano.db.create(dbName, (err, body) => {
//       if (err) return console.error('Error creating database ' + dbName)
//       // https://github.com/eHealthAfrica/couchdb-best-practices
//     })
//   }
// })

const couchPath = couchdb + '/' + dbName
console.log(couchPath)
push(couchPath, './.couchdb/messages', { index: true }, (err, resp) => {
  if (err) return console.error(err)
  console.log(resp)
})

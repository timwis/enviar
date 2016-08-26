const keyBy = require('lodash/keyBy')

const formatData = require('./format-data')

module.exports = seedWithMessages

// Fetch messages since last run (or a full page if empty db)
function seedWithMessages (db, twilio) {
  db.list({
    descending: true,
    limit: 1,
    include_docs: true,
    endkey: 'msg-' // _ comes before m in ASCII sort
  }, (err, body) => {
    if (err) return console.error(err)

    if (body.rows.length) {
      // If db already contains message records, fetch records since latest one
      console.log('most recent message', body.rows[0])
      twilio.messages.get({ 'DateSent>': body.rows[0].doc.date }, formatAndInsert)
    } else {
      // Otherwise it's a fresh db - fetch a page of messages
      console.log('no messages in db')
      twilio.messages.get({}, formatAndInsert)
    }
  })

  function formatAndInsert (err, response) {
    if (err) return console.error('Error fetching messages from twilio')
    const fetchedMessages = response.messages.map(formatData.fromTwilioRest)
    const fetchedProviderIds = fetchedMessages.map((msg) => msg.providerId)

    // Check if messages are already stored in local db
    db.view('messages', 'byProviderId', { keys: fetchedProviderIds }, (err, body) => {
      if (err) return console.error('Error querying view', err)

      const updateBatch = detectUpdates(fetchedMessages, body.rows)

      db.bulk({ docs: updateBatch }, (err, body) => {
        if (err) return console.error('Error inserting messages into database', err)
        console.log(body)
      })
    })
  }
}

// For each message from the provider, check for a match in the local db.
// If any changes, get its _id and _rev to update the record instead of
// inserting a new one. But if no changes, just discard the record from
// the update batch. If no match, just insert the record as-is.
function detectUpdates (fetched, existing) {
  const existingByProviderId = keyBy(existing, 'key')

  return fetched.map((msg) => {
    const match = existingByProviderId[msg.providerId]
    if (match) {
      if (msg.status !== match.value.status) {
        // Changes detected (we only care about status at the moment)
        msg._id = match.id
        msg._rev = match.value._rev
      } else {
        // Since map doesn't let us remove the record, we set this for .filter()
        msg.noChanges = true
      }
    }
    return msg
  }).filter((msg) => !msg.noChanges)
}

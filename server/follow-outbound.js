const formatData = require('./format-data')

module.exports = followOutbound

// Subscribe to pending outbound messages and send them to twilio
function followOutbound (db, twilio, phone) {
  const feed = db.follow({
    filter: 'messages/pendingOutbound',
    include_docs: true
  })

  feed.on('change', (change) => {
    const payload = formatData.toTwilioRest(change.doc)
    payload.From = phone

    // Dispatch to twilio
    twilio.messages.post(payload, (err, response) => {
      if (err) return console.error('Error sending message to provider')

      const formattedResponse = formatData.fromTwilioRest(response)

      // Update existing doc instead of inserting a new one
      formattedResponse._id = change.id
      formattedResponse._rev = change.doc._rev

      db.insert(formattedResponse, (err, body) => {
        if (err) return console.error('Error updating message in db', err)
        console.log('outbound', formattedResponse)
      })
    })
  })
  feed.follow()
  return feed
}

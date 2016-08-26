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

    twilio.messages.post(payload, (err, response) => {
      if (err) return console.error('Error sending message to provider')

      const formattedResponse = formatData.fromTwilioRest(response)
      formattedResponse._id = change.id
      formattedResponse._rev = change.doc._rev
      console.log('outbound', formattedResponse)

      db.insert(formattedResponse, (err, body) => {
        if (err) return console.error('Error updating message in db', err)
      })
    })
  })
  feed.follow()
  return feed
}

const formatData = require('./format-data')
const respond = require('./util').respond

module.exports = receiveInbound

// Handle inbound messages from twilio webhooks
function receiveInbound (db) {
  return function receiveInboundHandler (req, res) {
    const formattedMessage = formatData.fromTwilioWebhook(req.body)

    db.insert(formattedMessage, (err, body) => {
      if (err) respond(res, 500, 'Error inserting inbound message into db')

      console.log('inbound', formattedMessage)
      res.end()
    })
  }
}

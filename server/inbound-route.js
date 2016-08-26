const formBody = require('body/form')

const formatData = require('./format-data')

module.exports = inboundRoute

// Handle inbound messages from twilio webhooks
function inboundRoute (router, db) {
  router.on('/api/inbound', {
    post: function (req, res) {
      formBody(req, {}, (err, body) => {
        if (err) {
          res.statusCode = 400
          return
        }

        const formattedMessage = formatData.fromTwilioWebhook(body)
        console.log('inbound', formattedMessage)

        db.insert(formattedMessage, (err, body) => {
          if (err) {
            res.statusCode = 500
            console.error('Error inserting inbound message into db', err)
            return
          }
          res.end()
        })
      })
    }
  })
}

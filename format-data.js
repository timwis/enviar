exports.fromTwilioRest = function (msg) {
  const timestamp = Date.parse(msg.dateCreated)
  return {
    _id: `msg-${timestamp}-${msg.sid}`,
    providerId: msg.sid,
    date: msg.dateCreated,
    from: msg.from,
    to: msg.to,
    body: msg.body,
    status: msg.status,
    direction: msg.direction === 'inbound' ? 'inbound' : 'outbound'
  }
}

exports.fromTwilioWebhook = function (msg) {
  const date = new Date()
  return {
    _id: `msg-${date.getTime()}-${msg.SmsSid}`,
    providerId: msg.SmsSid,
    date: date.toISOString(),
    from: msg.From,
    to: msg.To,
    body: msg.Body,
    status: msg.SmsStatus,
    direction: 'inbound'
  }
}

exports.toTwilioRest = function (msg) {
  return {
    To: msg.to,
    body: msg.body
  }
}

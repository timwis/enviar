exports.rest = function (msg) {
  return {
    id: msg.sid,
    date: msg.dateCreated,
    from: msg.from,
    to: msg.to,
    body: msg.body,
    status: msg.status,
    direction: msg.direction
  }
}

exports.webhook = function (msg) {
  return {
    id: msg.SmsSid,
    date: (new Date()).toISOString(),
    from: msg.From,
    to: msg.To,
    body: msg.Body,
    status: msg.SmsStatus,
    direction: 'inbound'
  }
}

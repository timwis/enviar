module.exports = {
  _id: '_design/messages',
  filters: {
    'pending-outbound': function (doc, req) {
      return !doc.providerId && doc.direction === 'outbound'
    }
  }
}

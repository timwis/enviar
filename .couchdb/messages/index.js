exports._id = '_design/messages'
exports.filters = {
  'pending-outbound': function (doc, req) {
    return !doc.providerId && doc.direction === 'outbound'
  }
}

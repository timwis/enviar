/* global emit */
module.exports = {
  _id: '_design/messages',
  views: {
    byProviderId: {
      map: function (doc) {
        if (doc.providerId) {
          emit(doc.providerId, { _rev: doc._rev, status: doc.status })
        }
      }
    }
  },
  filters: {
    pendingOutbound: function (doc, req) {
      return !doc.providerId && doc.direction === 'outbound'
    }
  }
}

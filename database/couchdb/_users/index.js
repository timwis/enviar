/* global emit */
module.exports = {
  _id: '_design/users',
  validate_doc_update: function (newDoc, oldDoc, userCtx, secObj) {
    if (newDoc._deleted !== true && (newDoc.name.indexOf('@') === -1 || newDoc.name.indexOf('.') === -1)) {
      throw({ forbidden: 'Username must be an email' }) // eslint-disable-line
    }
  },
  views: {
    byResetToken: {
      map: function (doc) {
        if (doc.metadata.resetToken) {
          emit(doc.metadata.resetToken.token, doc.metadata.resetToken.created)
        }
      }
    }
  }
}

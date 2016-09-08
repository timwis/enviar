/* global emit */
module.exports = {
  _id: '_design/users',
  views: {
    byEmail: {
      map: function (doc) {
        emit(doc.metadata.email)
      }
    },
    byResetToken: {
      map: function (doc) {
        if (doc.metadata.resetToken) {
          emit(doc.metadata.resetToken.token, doc.metadata.resetToken.created)
        }
      }
    }
  }
}

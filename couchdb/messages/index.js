module.exports = {
  _id: '_design/messages',
  filters: {
    drafts: function (doc, req) {
      return doc._id.split('-')[0] === 'draft'
    }
  }
}

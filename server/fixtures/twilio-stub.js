const messages = require('./messages.json')
const outbound = require('./outbound.json')

module.exports = {
  messages: {
    get: (params, cb) => {
      setTimeout(() => cb(null, messages), 500)
    },
    post: (data, cb) => {
      const response = Object.assign({}, outbound)
      response.body = data.body
      response.to = data.To
      response.dateCreated = (new Date()).toISOString()
      response.sid = (Math.random() + '').substring(2, 7)
      setTimeout(() => cb(null, response), 500)
    }
  }
}

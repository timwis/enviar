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
      response.sid = 'STUB' + guid()
      setTimeout(() => cb(null, response), 500)
    }
  }
}

function guid () {
  function s4 () {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  }
  return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4()
}

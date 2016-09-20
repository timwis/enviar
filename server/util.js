const url = require('url')

exports.respond = function respond (res, statusCode, message) {
  if (statusCode) {
    res.statusCode = statusCode
  }
  if (message) {
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ message }))
  }
  return res.end()
}

exports.parseBody = function parseBody (parser, handler) {
  return function (req, res) {
    parser(req, (err, body) => {
      if (err) return exports.respond(res, 400, 'Error parsing request body')
      req.body = body
      handler(req, res)
    })
  }
}

exports.addAuthToUrl = function addAuthToUrl (plainUrl, user, pass) {
  const urlObj = url.parse(plainUrl)
  urlObj.auth = user + ':' + pass
  return url.format(urlObj)
}

// bankai returns http route handlers that return a stream
exports.pipeToResponse = function pipeToResponse (handler) {
  return (req, res) => handler(req, res).pipe(res)
}

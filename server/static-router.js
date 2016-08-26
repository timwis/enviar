const serverRouter = require('server-router')
const bankai = require('bankai')
const browserify = require('browserify')

module.exports = staticRouter

// Serve client application
function staticRouter ({ title, dev }) {
  const router = serverRouter()

  const html = bankai.html({ title })
  router.on('/', wrapHandler(html))

  const css = bankai.css()
  router.on('/bundle.css', wrapHandler(css))

  const js = bankai.js(browserify, __dirname + '/client/index.js', { transform: 'envify', debug: dev })
  router.on('/bundle.js', wrapHandler(js))

  return router

  function wrapHandler (handler) {
    // bankai returns http route handlers that return a stream
    return (req, res) => handler(req, res).pipe(res)
  }
}

const serverRouter = require('server-router')
const bankai = require('bankai')
const browserify = require('browserify')
const path = require('path')

module.exports = staticRouter

// Serve client application
function staticRouter (title, dev) {
  const router = serverRouter()
  const assets = bankai()

  const html = assets.html({ title })
  router.on('/', wrapHandler(html))

  const css = assets.css()
  router.on('/bundle.css', wrapHandler(css))

  const jsPath = path.resolve(__dirname, '../client/index.js')
  const js = assets.js(browserify, jsPath, { transform: 'envify', debug: dev })
  router.on('/bundle.js', wrapHandler(js))

  return router

  function wrapHandler (handler) {
    // bankai returns http route handlers that return a stream
    return (req, res) => handler(req, res).pipe(res)
  }
}

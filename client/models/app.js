const series = require('run-series')
const Push = require('push.js')

module.exports = (db) => ({
  state: {},
  reducers: {},
  effects: {
    initialize: (data, state, send, done) => {
      db.getSession((err, body) => {
        if (err) {
          // Error with request
          return done(new Error('Error getting current session'))
        } else if (!body.userCtx.name) {
          // Not logged in
          const path = '/login'
          send('redirect', path, done)
        } else {
          // Logged in
          series([
            (cb) => send('user:set', body.userCtx, cb),
            (cb) => send('convos:fetch', cb)
          ], done)
        }
      })
    },
    redirect: (path, state, send, done) => {
      window.history.pushState({}, null, path)
      send('location:setLocation', { location: path }, done)
    },
    pushNotification: (data, state, send, done) => {
      // Only send for new messages
      if (!(data._id in state.convos.messages)) {
        const path = '/' + data.from
        Push.create(data.from, {
          body: data.body,
          icon: 'https://i.imgur.com/w6dveCM.png',
          onClick: function () {
            window.focus()
            send('redirect', path, done)
            this.close()
          }
        })
      }
      done()
    }
  }
})

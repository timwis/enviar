const series = require('run-series')

module.exports = (db) => ({
  namespace: 'user',
  state: {
    name: '',
    roles: []
  },
  reducers: {
    set: (userCtx, state) => {
      return userCtx
    },
    reset: (data, state) => {
      return module.exports().state
    }
  },
  effects: {
    login: (data, state, send, done) => {
      const { username, password } = data
      db.login(username, password, (err, body) => {
        if (err) return done(new Error('Login error'))
        window.location.href = '/' // force refresh to call subscriptions again
      })
    },
    logout: (data, state, send, done) => {
      db.logout((err) => {
        if (err) return done(new Error('Error logging out'))
        series([
          (cb) => send('user:reset', cb),
          (cb) => send('convos:reset', cb),
          (cb) => send('redirect', '/login', cb)
        ], done)
      })
    },
    changePassword: (data, state, send, done) => {
      db.changePassword(state.name, data.password, (err, body) => {
        if (err) return done(new Error('Error changing password'))
        const loginData = { username: state.name, password: data.password }
        send('user:login', loginData, done)
      })
    }
  }
})

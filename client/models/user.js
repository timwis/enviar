const series = require('run-series')
const http = require('choo/http')

module.exports = (db, initialState) => ({
  namespace: 'user',
  state: initialState || {
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
    },
    resetPasswordInit: (data, state, send, done) => {
      http.post({
        uri: '/api/reset-password-init',
        json: data
      }, (err, response, body) => {
        if (err || response.statusCode !== 200) return done(new Error('Error initializing password reset'))
        send('ui:set', {resetPasswordInitSubmitted: true}, done)
      })
    },
    resetPasswordConfirm: (data, state, send, done) => {
      http.post({
        uri: '/api/reset-password-confirm',
        json: data
      }, (err, response, body) => {
        if (err || response.statusCode !== 200) return done(new Error('Error confirming password reset'))
        send('ui:set', {resetPasswordConfirmSubmitted: true}, done)
      })
    }
  }
})

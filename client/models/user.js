module.exports = (db) => ({
  namespace: 'user',
  state: {
    name: '',
    roles: []
  },
  reducers: {
    set: (userCtx, state) => {
      return { user: userCtx }
    }
  },
  effects: {
    login: (data, state, send, done) => {
      const { username, password } = data
      db.login(username, password, (err, body) => {
        if (err) return console.error('Login error', err)
        window.location.href = '/' // force refresh to call subscriptions again
      })
    },
    logout: (data, state, send, done) => {
      db.logout((err) => {
        if (err) return done(new Error('Error logging out'))
        send('redirect', '/login', done)
      })
    }
  }
})

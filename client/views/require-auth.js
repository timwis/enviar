const { hasAgentAccess } = require('../util')

module.exports = function RequireAuth (CurrentView) {
  return (state, prev, send) => {
    if (hasAgentAccess(state.user)) {
      return CurrentView(state, prev, send)
    } else {
      send('redirect', '/login')
      return document.createElement('div')
    }
  }
}

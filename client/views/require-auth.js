const VALID_ROLES = ['agent', '_admin']

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

function hasAgentAccess (userCtx) {
  return userCtx.roles.some((role) => VALID_ROLES.indexOf(role) !== -1)
}

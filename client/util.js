const VALID_ROLES = ['agent', '_admin']

exports.hasAgentAccess = function hasAgentAccess (userCtx) {
  return userCtx.roles.some((role) => VALID_ROLES.indexOf(role) !== -1)
}

exports.hasAdminAccess = function hasAdminAccess (userCtx) {
  return userCtx.roles.indexOf('_admin') !== -1
}

exports.formatPhone = function formatPhone (phone) {
  return `(${phone.substring(2, 5)}) ${phone.substring(5, 8)}-${phone.substring(8)}`
}

exports.validatePhone = function validatePhone (input) {
  const numbers = input.replace(/\D/g, '')
  if (numbers.length === 10) {
    return '+1' + numbers
  } else if (numbers.length === 11 && numbers[0] === 1) {
    return '+' + numbers
  } else {
    return false
  }
}

exports.localStorageWrapper = function localStorageWrapper (key, value, cb) {
  // if (!cb && typeof value === 'function') cb = value
  // const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
  if (!cb && typeof value === 'function') {
    // Get
    cb = value
    try {
      const stringResult = window.localStorage.getItem(key)
      if (stringResult) {
        try {
          const parsedResult = JSON.parse(stringResult)
          return cb(null, parsedResult)
        } catch (e) {
          return cb(null, stringResult)
        }
      }
      return cb()
    } catch (e) {
      return cb(new Error('Error retrieving item from localStorage'))
    }
  } else {
    // Set
    let stringValue
    if (typeof value === 'string') {
      stringValue = value
    } else {
      try {
        stringValue = JSON.stringify(value)
      } catch (e) {
        return cb(new Error('Error converting value to string'))
      }
    }
    try {
      window.localStorage.setItem(key, stringValue)
      return cb()
    } catch (e) {
      return cb(new Error('Error saving value to localStorage'))
    }
  }
}

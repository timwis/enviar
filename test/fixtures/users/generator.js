exports.matchWithEmail = function (email) {
  return {
    rows: [
      {
        doc: {
          metadata: {
            email: 'foo@bar.com'
          }
        }
      }
    ]
  }
}

exports.matchWithToken = function (email, token, minutesAgo) {
  const created = Date.now() - minutesAgo * 60e3
  return {
    rows: [
      {
        value: created,
        doc: {
          metadata: {
            email,
            resetToken: {
              created,
              token
            }
          }
        }
      }
    ]
  }
}

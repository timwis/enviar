const uuid = require('node-uuid')
const extend = require('xtend')

const respond = require('./util').respond

const TOKEN_LIFESPAN = 30 // minutes

exports.initReset = initReset
exports.confirmReset = confirmReset

function initReset (db, emailClient) {
  return function initResetHandler (req, res) {
    const email = req.body.email
    if (!email) return respond(res, 400, 'No email provided')

    // Find user document
    const viewOpts = { keys: [email], include_docs: true }
    db.view('users', 'byEmail', viewOpts, (err, body) => {
      if (err) return respond(res, 404, 'Error finding user document')

      if (body.rows.length) {
        const token = uuid.v4()
        const newUserDoc = extend(body.rows[0].doc)
        newUserDoc.metadata.resetToken = {
          created: Date.now(),
          token
        }

        db.insert(newUserDoc, (err, body) => {
          if (err) return respond(res, 500, 'Error adding reset token to user document')

          const emailConfig = {
            From: 'tim@timwis.com',
            To: email,
            Subject: 'Password reset for enviar',
            TextBody: 'Reset token: ' + token
          }

          emailClient.sendEmail(emailConfig, (err, result) => {
            if (err) return respond(res, 500, 'Error sending reset email')

            res.statusCode = 200
            res.end()
          })
        })
      } else {
        // No user found. Send email letting them know.
        const emailConfig = {
          From: 'tim@timwis.com',
          To: email,
          Subject: 'Password reset for enviar',
          TextBody: 'No account found with this email'
        }

        emailClient.sendEmail(emailConfig, (err, result) => {
          if (err) return respond(res, 500, 'Error sending reset email')

          res.statusCode = 200
          res.end()
        })
      }
    })
  }
}

function confirmReset (db) {
  return function confirmResetHandler (req, res) {
    const { token, password } = req.body
    if (!token || !password) return respond(res, 400, 'Token or password missing')

    const viewOpts = { keys: [token], include_docs: true }
    db.view('users', 'byResetToken', viewOpts, (err, body) => {
      if (err) return respond(res, 500, 'Error fetching user document')
      if (!body.rows.length || isExpired(body.rows[0].value)) {
        return respond(res, 404, 'Token not found or token is inactive')
      }

      // User document found with that token
      const newUserDoc = extend(body.rows[0].doc)
      newUserDoc.password = password
      delete newUserDoc.metadata.resetToken

      db.insert(newUserDoc, (err, body) => {
        if (err) respond(res, 500, 'Error saving user document')

        res.statusCode = 200
        res.end()
      })
    })
  }
}

function isExpired (timestamp) {
  return (Date.now() - timestamp) / 1000 / 60 > TOKEN_LIFESPAN
}

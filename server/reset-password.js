const uuid = require('node-uuid')
const extend = require('xtend')
const path = require('path')

const BASE_URL = process.env.BASE_URL
const FROM_EMAIL = process.env.FROM_EMAIL

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
        // Found user document
        const token = uuid.v4()
        const newUserDoc = extend(body.rows[0].doc)
        newUserDoc.metadata.resetToken = {
          created: Date.now(),
          token
        }

        // Add reset token to user document
        db.insert(newUserDoc, (err, body) => {
          if (err) return respond(res, 500, 'Error adding reset token to user document')

          const emailConfig = {
            From: FROM_EMAIL,
            To: email,
            Subject: 'Password reset for enviar',
            TextBody: resetEmailTemplate(token)
          }

          // Email reset token to user
          emailClient.sendEmail(emailConfig, (err, result) => {
            if (err) return respond(res, 500, 'Error sending reset email')

            res.statusCode = 200
            res.end()
          })
        })
      } else {
        // No user found
        const emailConfig = {
          From: FROM_EMAIL,
          To: email,
          Subject: 'Attempted password reset for enviar',
          TextBody: notFoundTemplate()
        }

        // Email "not found" notice to user
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

      // Update password and remove reset token from user document
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

function resetEmailTemplate (token) {
  return `
    Hello,

    Follow this link to reset your enviar password for your tim@timwis.com account.

    ${path.join(BASE_URL, '/reset-password/', token)}

    If you didn’t ask to reset your password, you can ignore this email.

    Thanks,

    The enviar team
  `
}

function notFoundTemplate () {
  return `
    You (or someone else) entered this email address when trying to change the password of an enviar account.

    However, this email address is not in our database of registered users and therefore the attempted password change has failed.

    If you have an enviar account and were expecting this email, please try again using the email address you gave when opening your account.

    If you do not have an enviar account, please ignore this email.

    For information about enviar, visit ${BASE_URL}.

    Kind regards,

    The enviar team
  `
}

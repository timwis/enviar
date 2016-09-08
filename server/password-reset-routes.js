const jsonBody = require('body/json')
const uuid = require('node-uuid')
const extend = require('xtend')

const TOKEN_LIFESPAN = 30 // minutes

exports.initReset = initReset
exports.confirmReset = confirmReset

function initReset (db, emailClient) {
  return function (req, res) {
    jsonBody(req, (err, body) => {
      if (err || !body.email) {
        res.statusCode = 400
        res.end()
        return
      }

      const email = body.email

      // Find user document
      db.view('users', 'byEmail', { keys: [email], include_docs: true }, (err, body) => {
        if (err) {
          console.error('Error finding user document', err)
          res.statusCode = 404
          res.end()
          return
        }

        if (body.rows.length) {
          const token = uuid.v4()
          const newUserDoc = extend(body.rows[0].doc)
          newUserDoc.metadata.resetToken = {
            created: Date.now(),
            token
          }

          db.insert(newUserDoc, (err, body) => {
            if (err) {
              res.statusCode = 500
              console.error('Error creating reset token document')
              res.end()
              return
            }

            console.log(body)

            const emailConfig = {
              From: 'tim@timwis.com',
              To: email,
              Subject: 'Password reset for enviar',
              TextBody: 'Reset token: ' + token
            }

            console.log('sending email', emailConfig)
            emailClient.sendEmail(emailConfig, (err, result) => {
              if (err) {
                res.statusCode = 500
                console.error('Error sending reset email', err)
                res.end()
                return
              }

              console.log('Email sent', result)
              res.statusCode = 200
              res.end()
            })
          })
        } else {
          // No user found. Send email letting them know.
          console.log('No user found')
          const emailConfig = {
            From: 'tim@timwis.com',
            To: email,
            Subject: 'Password reset for enviar',
            TextBody: 'No account found with this email'
          }

          console.log('sending email', emailConfig)
          emailClient.sendEmail(emailConfig, (err, result) => {
            if (err) {
              res.statusCode = 500
              console.error('Error sending reset email', err)
              res.end()
              return
            }

            console.log('Email sent', result)
            res.statusCode = 200
            res.end()
          })
        }
      })
    })
  }
}

function confirmReset (db) {
  return function (req, res) {
    jsonBody(req, (err, body) => {
      if (err || !body.token || !body.password) {
        res.statusCode = 400
        res.end()
        return
      }

      const { token, password } = body

      db.view('users', 'byResetToken', { keys: [token], include_docs: true }, (err, body) => {
        if (err) {
          console.error('Error fetching user document', err)
          res.statusCode = 500
          res.end()
          return
        } else if (!body.rows.length || isExpired(body.rows[0].value)) {
          // No documents found by that token, or the token is expired
          res.statusCode = 404
          res.end()
          return
        }

        // User document found with that token
        const newUserDoc = extend(body.rows[0].doc)
        newUserDoc.password = password
        delete newUserDoc.metadata.resetToken

        db.insert(newUserDoc, (err, body) => {
          if (err) {
            console.error('Error saving user document', err)
            res.statusCode = 500
            res.end()
            return
          }

          console.log('Password changed', body)
          res.statusCode = 200
          res.end()
        })
      })
    })
  }
}

function isExpired (timestamp) {
  return (Date.now() - timestamp) / 1000 / 60 > TOKEN_LIFESPAN
}

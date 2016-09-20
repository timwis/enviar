const test = require('ava')
const td = require('testdouble')

const { initReset, confirmReset } = require('../../server/reset-password')
const { matchWithEmail, matchWithToken } = require('../fixtures/users/generator')

test('reset password : initReset : if no user found, return 200 and send not found email', (t) => {
  const email = 'foo@bar.com'
  const sampleData = { rows: [] }
  const db = stubDB('byEmail', email, sampleData)
  const emailClient = stubEmail()
  const res = stubResponse()
  const req = { body: { email } }

  const initResetHandler = initReset(db, emailClient)
  initResetHandler(req, res)

  const emailConfigMatch = { Subject: 'Attempted password reset for enviar' }
  td.verify(emailClient.sendEmail(td.matchers.contains(emailConfigMatch), td.matchers.isA(Function)))

  t.is(res.statusCode, 200, 'status code is 200')
})

test('reset password : initReset : if user found, save reset token & email them', (t) => {
  const email = 'foo@bar.com'
  const sampleData = matchWithEmail(email)
  const db = stubDB('byEmail', email, sampleData)
  const emailClient = stubEmail()
  const res = stubResponse()
  const req = { body: { email } }

  const initResetHandler = initReset(db, emailClient)
  initResetHandler(req, res)

  td.verify(db.insert(td.matchers.isA(Object), td.matchers.isA(Function)))

  const emailConfigMatch = { Subject: 'Password reset for enviar' }
  td.verify(emailClient.sendEmail(td.matchers.contains(emailConfigMatch), td.matchers.isA(Function)))

  t.is(res.statusCode, 200, 'status code is 200')
})

test('reset password : confirmReset : if no user found, return 404', (t) => {
  const token = 'a9s8df7a98sd'
  const password = 'foobar'
  const sampleData = { rows: [] }
  const db = stubDB('byResetToken', token, sampleData)
  const res = stubResponse()
  const req = { body: { token, password } }

  const confirmResetHandler = confirmReset(db)
  confirmResetHandler(req, res)
  t.is(res.statusCode, 404, 'status code is 404')
})

test('reset password : confirmReset : if token expired, return 404', (t) => {
  const token = 'a9s8df7a98sd'
  const password = 'foobar'
  const email = 'foo@bar.com'
  const sampleData = matchWithToken(email, token, 31)
  const db = stubDB('byResetToken', token, sampleData)
  const res = stubResponse()
  const req = { body: { token, password } }

  const confirmResetHandler = confirmReset(db)
  confirmResetHandler(req, res)
  t.is(res.statusCode, 404, 'status code is 404')
})

test('reset password : confirmReset : if valid token, reset password and delete token', (t) => {
  const token = 'a9s8df7a98sd'
  const password = 'foobar'
  const email = 'foo@bar.com'
  const sampleData = matchWithToken(email, token, 29)
  const db = stubDB('byResetToken', token, sampleData)
  const res = stubResponse()
  const req = { body: { token, password } }

  const confirmResetHandler = confirmReset(db)
  confirmResetHandler(req, res)

  td.verify(db.insert(td.matchers.argThat((n) => n.password === password && !n.metadata.resetToken), td.matchers.isA(Function)))

  t.is(res.statusCode, 200, 'status code is 200')
})

function stubDB (viewName, key, response) {
  const db = td.object({
    view: () => {},
    insert: () => {}
  })
  const viewOpts = { keys: [key], include_docs: true }
  td.when(db.view('users', viewName, viewOpts)).thenCallback(null, response)
  td.when(db.insert(td.matchers.isA(Object))).thenCallback()
  return db
}

function stubEmail () {
  const emailClient = td.object({
    sendEmail: () => {}
  })
  td.when(emailClient.sendEmail(td.matchers.isA(Object))).thenCallback()
  return emailClient
}

function stubResponse () {
  return td.object({
    statusCode: null,
    setHeader: () => {},
    end: () => {}
  })
}

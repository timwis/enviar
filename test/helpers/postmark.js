module.exports = { Client }

function Client (token) {
  this.token = token
}

Client.prototype.sendEmail = (config, cb) => {
  console.log('Simulating email', config)
  cb(null, {})
}

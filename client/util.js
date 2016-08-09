exports.formatPhone = function formatPhone (phone) {
  return `(${phone.substring(2, 5)}) ${phone.substring(5, 8)}-${phone.substring(8)}`
}

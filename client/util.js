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

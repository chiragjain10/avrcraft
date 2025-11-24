// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone number validation (Indian)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

// Password validation
export const isValidPassword = (password) => {
  return password.length >= 6
}

// PIN code validation (Indian)
export const isValidPincode = (pincode) => {
  const pincodeRegex = /^\d{6}$/
  return pincodeRegex.test(pincode)
}

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Credit card validation (Luhn algorithm)
export const isValidCreditCard = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '')
  
  if (cleaned.length < 13 || cleaned.length > 19) return false
  
  let sum = 0
  let isEven = false
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

// Expiry date validation
export const isValidExpiryDate = (expiry) => {
  const [month, year] = expiry.split('/').map(Number)
  
  if (!month || !year || month < 1 || month > 12) return false
  
  const currentYear = new Date().getFullYear() % 100
  const currentMonth = new Date().getMonth() + 1
  
  if (year < currentYear) return false
  if (year === currentYear && month < currentMonth) return false
  
  return true
}

// CVV validation
export const isValidCVV = (cvv) => {
  const cvvRegex = /^\d{3,4}$/
  return cvvRegex.test(cvv)
}

// Required field validation
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== ''
}

// Minimum length validation
export const hasMinLength = (value, minLength) => {
  return value && value.length >= minLength
}

// Maximum length validation
export const hasMaxLength = (value, maxLength) => {
  return value && value.length <= maxLength
}

// Number range validation
export const isInRange = (value, min, max) => {
  const num = parseFloat(value)
  return !isNaN(num) && num >= min && num <= max
}

// File type validation
export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type)
}

// File size validation
export const isValidFileSize = (file, maxSizeInMB) => {
  const maxSize = maxSizeInMB * 1024 * 1024
  return file.size <= maxSize
}
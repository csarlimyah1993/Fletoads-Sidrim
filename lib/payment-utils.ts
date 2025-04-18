/**
 * Format a card number with spaces after every 4 digits
 */
export function formatCardNumber(value: string): string {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
  const matches = v.match(/\d{4,16}/g)
  const match = (matches && matches[0]) || ""
  const parts = []

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }

  if (parts.length) {
    return parts.join(" ")
  } else {
    return value
  }
}

/**
 * Format card expiry date as MM/YY
 */
export function formatExpiry(value: string): string {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")

  if (v.length >= 2) {
    return `${v.substring(0, 2)}/${v.substring(2, 4)}`
  }

  return v
}

/**
 * Get the appropriate icon for a card brand
 */
export function getCardBrandIcon(brand: string): string {
  const brandIcons: Record<string, string> = {
    visa: "visa",
    mastercard: "mastercard",
    amex: "amex",
    discover: "discover",
    jcb: "jcb",
    diners: "diners",
    unionpay: "unionpay",
  }

  return brandIcons[brand.toLowerCase()] || "credit-card"
}

/**
 * Validate a credit card number using the Luhn algorithm
 */
export function validateCardNumber(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\s+/g, "")

  // Check if the input contains only digits
  if (!/^\d+$/.test(sanitized)) return false

  // Check length (most cards are between 13-19 digits)
  if (sanitized.length < 13 || sanitized.length > 19) return false

  // Luhn algorithm
  let sum = 0
  let shouldDouble = false

  // Loop through values starting from the rightmost digit
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(sanitized.charAt(i))

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

/**
 * Validate card expiry date
 */
export function validateExpiry(expiry: string): boolean {
  const [monthStr, yearStr] = expiry.split("/")

  if (!monthStr || !yearStr) return false

  const month = Number.parseInt(monthStr, 10)
  const year = Number.parseInt(`20${yearStr}`, 10)

  // Check if month is between 1 and 12
  if (month < 1 || month > 12) return false

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // JavaScript months are 0-indexed

  // Check if the card is not expired
  if (year < currentYear) return false
  if (year === currentYear && month < currentMonth) return false

  // Check if the date is not too far in the future (e.g., 10 years)
  if (year > currentYear + 10) return false

  return true
}

/**
 * Validate CVC code
 */
export function validateCVC(cvc: string, cardType?: string): boolean {
  const sanitized = cvc.replace(/\s+/g, "")

  // Check if the input contains only digits
  if (!/^\d+$/.test(sanitized)) return false

  // American Express cards have 4-digit CVC
  if (cardType?.toLowerCase() === "amex") {
    return sanitized.length === 4
  }

  // Most other cards have 3-digit CVC
  return sanitized.length === 3
}

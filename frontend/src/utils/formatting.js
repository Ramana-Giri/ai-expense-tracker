/**
 * Format paise (integer) to Indian Rupee display format
 * @param {number} paise - Amount in paise
 * @returns {string} Formatted string like ₹1,25,000.00
 */
export const formatCurrency = (paise) => {
  if (!paise) return '₹0.00'
  
  const rupees = paise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees)
}

/**
 * Format paise to display format without currency symbol
 */
export const formatAmount = (paise) => {
  if (!paise) return '0.00'
  
  const rupees = paise / 100
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees)
}

/**
 * Convert rupees (decimal) to paise (integer)
 */
export const rupeesToPaise = (rupees) => {
  return Math.round(rupees * 100)
}

/**
 * Convert paise to rupees
 */
export const paiseToRupees = (paise) => {
  return paise / 100
}

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/**
 * Format date for input (YYYY-MM-DD)
 */
export const formatDateForInput = (dateString) => {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

/**
 * Get month label (e.g., "November 2024")
 */
export const getMonthLabel = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
  }).format(date)
}

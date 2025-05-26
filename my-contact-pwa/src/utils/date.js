// d:\vscode\wpacontactsbook\wpacontactsbook\my-contact-pwa\src\utils\date.js

/**
 * Formats a date value into a readable string.
 * @param {string | Date | number} dateValue - The date value to format.
 * @returns {string} The formatted date string.
 */
export function formatDate(dateValue) {
  if (!dateValue) {
    return ''
  }

  try {
    // Attempt to create a Date object
    const date = new Date(dateValue)

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      // If invalid, return the original value or an error message
      console.error('Invalid date value provided:', dateValue)
      return String(dateValue) // Return original value as string
    }

    // Use toLocaleDateString for basic formatting. Adjust options as needed.
    // This will use the user's locale for formatting.
    return date.toLocaleDateString()
  } catch (error) {
    console.error('Error formatting date:', dateValue, error)
    return String(dateValue) // Return original value as string on error
  }
}

import DOMPurify from 'dompurify'

export function sanitizeInput(str) {
  return DOMPurify.sanitize(str, { FORBID_ATTR: ['style', 'onerror'] })
}

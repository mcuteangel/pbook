// src/utils/customFields.js
import { toRaw } from 'vue'

export function getDefaultCustomFieldValue(fieldDefinition) {
  if (!fieldDefinition) return null

  // بر اساس نوع فیلد، مقدار پیش‌فرض را بر می‌گرداند
  switch (fieldDefinition.type) {
    case 'text':
      return ''
    case 'number':
      return 0
    case 'date':
      return null
    case 'select':
      return fieldDefinition.options[0]?.value || null
    case 'checkbox':
      return false
    default:
      return null
  }
}

/**
 * دریافت تعریف فیلد سفارشی بر اساس شناسه
 * @param {string|number} fieldId - شناسه فیلد
 * @returns {Object|null} تعریف فیلد یا null در صورت عدم وجود
 */
export function getFieldDefinitionById(fieldId) {
  // اگر فیلد استاندارد است، آن را به عنوان فیلد سفارشی در نظر نگیر
  if (typeof fieldId === 'string' && !/^\d+$/.test(fieldId)) {
    return null
  }

  const id = typeof fieldId === 'string' ? parseInt(fieldId, 10) : fieldId
  if (isNaN(id)) {
    console.warn(
      `Invalid ID passed to getFieldDefinitionById: ${fieldId}. Conversion to Number failed.`,
    )
    return null
  }

  return customFields.value.find((field) => field.id === id) || null
}

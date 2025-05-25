// src/utils/customFields.js
import { toRaw } from 'vue'

export function getDefaultCustomFieldValue(fieldDefinition) {
  if (!fieldDefinition) return null;

  // بر اساس نوع فیلد، مقدار پیش‌فرض را بر می‌گرداند
  switch (fieldDefinition.type) {
    case 'text':
      return '';
    case 'number':
      return 0;
    case 'date':
      return null;
    case 'select':
      return fieldDefinition.options[0]?.value || null;
    case 'checkbox':
      return false;
    default:
      return null;
  }
}

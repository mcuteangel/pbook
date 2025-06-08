/**
 * تعریف عملگرهای پایه برای فیلترها
 */
export const baseOperators = {
  text: [
    { value: 'contains', label: 'contactList.operators.contains', description: 'شامل متن باشد' },
    {
      value: 'notContains',
      label: 'contactList.operators.notContains',
      description: 'شامل متن نباشد',
    },
    { value: 'equals', label: 'contactList.operators.equals', description: 'دقیقاً برابر باشد' },
    { value: 'notEquals', label: 'contactList.operators.notEquals', description: 'برابر نباشد' },
    { value: 'startsWith', label: 'contactList.operators.startsWith', description: 'شروع شود با' },
    { value: 'endsWith', label: 'contactList.operators.endsWith', description: 'پایان یابد با' },
  ],
  number: [
    { value: 'equals', label: 'contactList.operators.equals', description: 'برابر باشد' },
    { value: 'notEquals', label: 'contactList.operators.notEquals', description: 'برابر نباشد' },
    { value: 'greaterThan', label: 'contactList.operators.greaterThan', description: 'بزرگتر از' },
    { value: 'lessThan', label: 'contactList.operators.lessThan', description: 'کوچکتر از' },
    {
      value: 'greaterThanOrEqual',
      label: 'contactList.operators.greaterThanOrEqual',
      description: 'بزرگتر یا برابر',
    },
    {
      value: 'lessThanOrEqual',
      label: 'contactList.operators.lessThanOrEqual',
      description: 'کوچکتر یا برابر',
    },
  ],
  date: [
    { value: 'equals', label: 'contactList.operators.equals', description: 'در تاریخ مشخص' },
    {
      value: 'notEquals',
      label: 'contactList.operators.notEquals',
      description: 'غیر از تاریخ مشخص',
    },
    { value: 'before', label: 'contactList.operators.before', description: 'قبل از تاریخ' },
    { value: 'after', label: 'contactList.operators.after', description: 'بعد از تاریخ' },
    {
      value: 'onOrBefore',
      label: 'contactList.operators.onOrBefore',
      description: 'در تاریخ یا قبل از آن',
    },
    {
      value: 'onOrAfter',
      label: 'contactList.operators.onOrAfter',
      description: 'در تاریخ یا بعد از آن',
    },
  ],
  email: [
    { value: 'contains', label: 'contactList.operators.contains', description: 'شامل متن باشد' },
    { value: 'equals', label: 'contactList.operators.equals', description: 'دقیقاً برابر باشد' },
    { value: 'notEquals', label: 'contactList.operators.notEquals', description: 'برابر نباشد' },
    { value: 'startsWith', label: 'contactList.operators.startsWith', description: 'شروع شود با' },
    { value: 'endsWith', label: 'contactList.operators.endsWith', description: 'پایان یابد با' },
  ],
  phone: [
    { value: 'contains', label: 'contactList.operators.contains', description: 'شامل شماره باشد' },
    { value: 'equals', label: 'contactList.operators.equals', description: 'دقیقاً برابر باشد' },
    { value: 'notEquals', label: 'contactList.operators.notEquals', description: 'برابر نباشد' },
  ],
}

/**
 * عملگرهای عمومی که برای همه انواع فیلدها قابل استفاده هستند
 */
export const commonOperators = [
  { value: 'isNull', label: 'contactList.operators.isNull', description: 'خالی باشد' },
  { value: 'isNotNull', label: 'contactList.operators.isNotNull', description: 'خالی نباشد' },
]

/**
 * دریافت عملگرهای مناسب برای یک نوع فیلد
 * @param {string} fieldType - نوع فیلد
 * @returns {Array} لیست عملگرهای مناسب
 */
export function getOperatorsForFieldType(fieldType) {
  if (baseOperators[fieldType]) {
    return [...baseOperators[fieldType], ...commonOperators]
  }

  if (['select', 'boolean', 'gender', 'group'].includes(fieldType)) {
    return [
      { value: 'equals', label: 'operators.equals', description: 'برابر باشد' },
      { value: 'notEquals', label: 'operators.notEquals', description: 'برابر نباشد' },
      ...commonOperators,
    ]
  }

  // عملگرهای پیش‌فرض برای انواع ناشناخته
  return [
    { value: 'contains', label: 'operators.contains', description: 'شامل متن باشد' },
    { value: 'equals', label: 'operators.equals', description: 'دقیقاً برابر باشد' },
    { value: 'notEquals', label: 'operators.notEquals', description: 'برابر نباشد' },
    ...commonOperators,
  ]
}

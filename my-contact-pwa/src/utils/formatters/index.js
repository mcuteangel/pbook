import moment from 'moment-jalaali'
import { useI18n } from 'vue-i18n'

// Enable Jalaali support in moment-jalaali
moment.loadPersian({ usePersianDigits: false })

// ===============================
// 1. توابع مربوط به تاریخ
// ===============================

/**
 * فرمت‌دهی تاریخ با استفاده از moment-jalaali
 * @param {string|Date|moment.Moment} date - تاریخ ورودی
 * @param {string} format - فرمت مورد نظر برای نمایش (پیش‌فرض: 'jYYYY/jMM/jDD')
 * @returns {string} تاریخ فرمت‌بندی شده
 */
export function formatDate(date, format = 'jYYYY/jMM/jDD') {
  if (!date) return ''
  const m = moment(date)
  if (!m.isValid()) {
    console.warn(`[formatDate] Invalid date provided: ${date}`)
    return String(date)
  }
  return m.format(format)
}

/**
 * پارس کردن رشته تاریخ شمسی به Moment object (میلادی)
 * @param {string} jalaaliString - رشته تاریخ شمسی
 * @returns {moment.Moment|null} شیء Moment یا null در صورت نامعتبر بودن
 */
export function parseJalaaliStringToGregorianMoment(jalaaliString) {
  if (typeof jalaaliString !== 'string' || !jalaaliString) return null
  const momentObj = moment(jalaaliString, 'jYYYY/jM/jD')
  return momentObj && momentObj.isValid() ? momentObj : null
}

/**
 * فرمت دهی تاریخ میلادی به فرمت نمایش شمسی
 * @param {string|Date|moment.Moment} gregorianDate - تاریخ میلادی
 * @param {boolean} includeTime - آیا زمان هم نمایش داده شود
 * @returns {string} تاریخ شمسی فرمت‌بندی شده
 */
export function formatGregorianDateToShamsi(gregorianDate, includeTime = false) {
  const { t } = useI18n()
  if (!gregorianDate) return ''

  let momentObj
  try {
    momentObj = moment(gregorianDate)
  } catch (e) {
    return t('formatters.date.errorParsingGregorian')
  }

  if (!momentObj || !momentObj.isValid()) {
    return t('formatters.date.invalid')
  }

  const formatString = includeTime ? 'jYYYY/jM/jD HH:mm:ss' : 'jYYYY/jM/jD'
  return momentObj.format(formatString)
}

// ===============================
// 2. توابع مربوط به آدرس
// ===============================

/**
 * فرمت‌دهی آدرس به صورت رشته
 * @param {Object} address - شیء آدرس
 * @returns {string} آدرس فرمت‌بندی شده
 */
export const formatAddress = (address) => {
  if (!address) return ''
  const parts = []
  if (address.street) parts.push(address.street)
  if (address.city) parts.push(address.city)
  if (address.province) parts.push(address.province)
  if (address.country) parts.push(address.country)
  return parts.join(', ')
}

/**
 * نمایش نوع آدرس
 * @param {string} typeValue - نوع آدرس
 * @returns {string} نام فارسی نوع آدرس
 */
export const displayAddressType = (typeValue) => {
  const { t } = useI18n()
  switch (typeValue) {
    case 'home':
      return t('formatters.addressType.home')
    case 'work':
      return t('formatters.addressType.work')
    case 'other':
      return t('formatters.addressType.other')
    default:
      return typeValue || t('formatters.addressType.unknown')
  }
}

// ===============================
// 3. توابع مربوط به تلفن
// ===============================

/**
 * نمایش نوع تلفن
 * @param {string} typeValue - نوع تلفن
 * @returns {string} نام فارسی نوع تلفن
 */
export const displayPhoneType = (typeValue) => {
  const { t } = useI18n()
  switch (typeValue) {
    case 'mobile':
      return t('formatters.phoneType.mobile')
    case 'home':
      return t('formatters.phoneType.home')
    case 'work':
      return t('formatters.phoneType.work')
    case 'office':
      return t('formatters.phoneType.office')
    case 'fax':
      return t('formatters.phoneType.fax')
    case 'other':
      return t('formatters.phoneType.other')
    default:
      return typeValue || t('formatters.phoneType.unknown')
  }
}

// ===============================
// 4. توابع مربوط به جنسیت
// ===============================

/**
 * نمایش جنسیت
 * @param {string} genderValue - مقدار جنسیت
 * @returns {string} نام فارسی جنسیت
 */
export const displayGender = (genderValue) => {
  const { t } = useI18n()
  switch (genderValue) {
    case 'male':
      return t('formatters.gender.male')
    case 'female':
      return t('formatters.gender.female')
    case 'other':
      return t('formatters.gender.other')
    case 'not_specified':
      return t('formatters.gender.notSpecified')
    default:
      return genderValue || t('formatters.gender.unknown')
  }
}

// ===============================
// 5. توابع مربوط به فیلدهای سفارشی
// ===============================

/**
 * فرمت‌دهی مقادیر فیلدهای سفارشی بر اساس نوع
 * @param {any} value - مقدار فیلد
 * @param {string} type - نوع فیلد
 * @param {Array} options - گزینه‌های فیلد (برای نوع select)
 * @returns {string} مقدار فرمت‌بندی شده
 */
export function formatCustomFieldValue(value, type, options = []) {
  const { t } = useI18n()
  if (value === undefined || value === null || value === '') {
    return ''
  }

  switch (type) {
    case 'text':
    case 'textarea':
    case 'number':
      return String(value)
    case 'date':
      return formatGregorianDateToShamsi(value)
    case 'boolean':
      return value ? t('formatters.boolean.yes') : t('formatters.boolean.no')
    case 'select':
      const selectedOption = options.find((opt) => opt.value === value)
      return selectedOption ? selectedOption.label : value
    default:
      return String(value)
  }
}

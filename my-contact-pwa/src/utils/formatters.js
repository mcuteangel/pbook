// src/utils/formatters.js

import moment from 'moment-jalaali'
import { useI18n } from 'vue-i18n'

// Enable Jalaali support in moment-jalaali
moment.loadPersian({ usePersianDigits: false })

// تابع کمکی برای پارس کردن رشته تاریخ شمسی به Moment object (میلادی)
export function parseJalaaliStringToGregorianMoment(jalaaliString) {
  if (typeof jalaaliString !== 'string' || !jalaaliString) return null

  let momentObj = null
  momentObj = moment(jalaaliString, 'jYYYY/jM/jD') // سعی با فرمت jYYYY/jM/jD

  if (!momentObj || !momentObj.isValid()) {
    return null
  }

  return momentObj // برگرداندن Moment object معتبر
}

// تابع اصلی: فرمت دهی تاریخ میلادی به فرمت نمایش شمسی
export function formatGregorianDateToShamsi(gregorianDate, includeTime = false) {
  const { t } = useI18n()
  if (!gregorianDate) {
    return ''
  }

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
  const formattedDate = momentObj.format(formatString)
  return formattedDate
}

// تابع برای فرمت‌دهی مقادیر فیلدهای سفارشی بر اساس نوع
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

// تابع برای نمایش جنسیت (از کد قبلی شما)
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

// تابع برای نمایش نوع تلفن (از کد قبلی شما)
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

// تابع برای نمایش نوع آدرس (از کد قبلی شما)
// تابع برای فرمت‌دهی آدرس به صورت رشته
export const formatAddress = (address) => {
  if (!address) return ''
  const parts = []
  if (address.street) parts.push(address.street)
  if (address.city) parts.push(address.city)
  if (address.province) parts.push(address.province)
  if (address.country) parts.push(address.country)
  return parts.join(', ')
}

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

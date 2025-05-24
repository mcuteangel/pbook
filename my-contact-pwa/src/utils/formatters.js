// src/utils/formatters.js

import moment from 'moment-jalaali'

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
  if (!gregorianDate) {
    return ''
  }

  let momentObj
  try {
    momentObj = moment(gregorianDate)
  } catch (e) {
    return 'خطا در پارس تاریخ میلادی'
  }

  if (!momentObj || !momentObj.isValid()) {
    return 'تاریخ نامعتبر'
  }

  const formatString = includeTime ? 'jYYYY/jM/jD HH:mm:ss' : 'jYYYY/jM/jD'
  const formattedDate = momentObj.format(formatString)
  return formattedDate
}

// تابع برای فرمت‌دهی مقادیر فیلدهای سفارشی بر اساس نوع
export function formatCustomFieldValue(value, type, options = []) {
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
      return value ? 'بله' : 'خیر'
    case 'select':
      const selectedOption = options.find((opt) => opt.value === value)
      return selectedOption ? selectedOption.label : value
    default:
      return String(value)
  }
}

// تابع برای نمایش جنسیت (از کد قبلی شما)
export const displayGender = (genderValue) => {
  switch (genderValue) {
    case 'male':
      return 'آقا'
    case 'female':
      return 'خانم'
    case 'other':
      return 'غیره'
    case 'not_specified':
      return 'ترجیح نمی‌دهم'
    default:
      return genderValue || 'نامشخص'
  }
}

// تابع برای نمایش نوع تلفن (از کد قبلی شما)
export const displayPhoneType = (typeValue) => {
  switch (typeValue) {
    case 'mobile':
      return 'موبایل'
    case 'home':
      return 'منزل'
    case 'work':
      return 'محل کار'
    case 'office':
      return 'مطب/دفتر'
    case 'fax':
      return 'فکس'
    case 'other':
      return 'دیگر'
    default:
      return typeValue || 'نامشخص'
  }
}

// تابع برای نمایش نوع آدرس (از کد قبلی شما)
export const displayAddressType = (typeValue) => {
  switch (typeValue) {
    case 'home':
      return 'منزل'
    case 'work':
      return 'محل کار'
    case 'other':
      return 'دیگر'
    default:
      return typeValue || 'نامشخص'
  }
}

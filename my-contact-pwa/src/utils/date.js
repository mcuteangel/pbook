// src/utils/date.js
import moment from 'moment-jalaali'

/**
 * فرمت‌دهی تاریخ با استفاده از moment-jalaali
 * @param {string|Date|moment.Moment} date - تاریخ ورودی
 * @param {string} format - فرمت مورد نظر برای نمایش (پیش‌فرض: 'jYYYY/jMM/jDD')
 * @returns {string} تاریخ فرمت‌بندی شده
 */
export function formatDate(date, format = 'jYYYY/jMM/jDD') {
  // اگر تاریخ ورودی وجود نداشت، رشته خالی برگردان
  if (!date) {
    return ''
  }

  // تبدیل تاریخ به شیء moment-jalaali
  const m = moment(date)

  // بررسی معتبر بودن شیء moment
  if (!m.isValid()) {
    console.warn(`[formatDate] Invalid date provided: ${date}`)
    return String(date) // برگرداندن ورودی اصلی اگر نامعتبر بود
  }

  // فرمت‌دهی و برگرداندن تاریخ
  return m.format(format)
}

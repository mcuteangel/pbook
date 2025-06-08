import { useI18n } from 'vue-i18n'
import moment from 'moment-jalaali'

/**
 * سرویس اعتبارسنجی مرکزی
 * این سرویس شامل تمام توابع اعتبارسنجی مشترک در پروژه است
 */
export const useValidation = () => {
  const { t } = useI18n()

  // ===============================
  // 1. اعتبارسنجی متن
  // ===============================

  /**
   * اعتبارسنجی متن
   * @param {string} value - مقدار ورودی
   * @param {Object} options - گزینه‌های اعتبارسنجی
   * @param {boolean} [options.required=false] - آیا فیلد اجباری است
   * @param {number} [options.minLength] - حداقل طول مجاز
   * @param {number} [options.maxLength] - حداکثر طول مجاز
   * @param {RegExp} [options.pattern] - الگوی مجاز
   * @returns {Object} نتیجه اعتبارسنجی
   */
  const validateText = (value, options = {}) => {
    const { required = false, minLength, maxLength, pattern } = options

    // بررسی مقدار خالی
    if (!value || value.trim() === '') {
      if (required) {
        return {
          isValid: false,
          message: t('validation.required'),
        }
      }
      return { isValid: true }
    }

    // بررسی حداقل طول
    if (minLength && value.length < minLength) {
      return {
        isValid: false,
        message: t('validation.minLength', { n: minLength }),
      }
    }

    // بررسی حداکثر طول
    if (maxLength && value.length > maxLength) {
      return {
        isValid: false,
        message: t('validation.maxLength', { n: maxLength }),
      }
    }

    // بررسی الگو
    if (pattern && !pattern.test(value)) {
      return {
        isValid: false,
        message: t('validation.pattern'),
      }
    }

    return { isValid: true }
  }

  // ===============================
  // 2. اعتبارسنجی ایمیل
  // ===============================

  /**
   * اعتبارسنجی ایمیل
   * @param {string} value - آدرس ایمیل
   * @param {Object} options - گزینه‌های اعتبارسنجی
   * @param {boolean} [options.required=false] - آیا فیلد اجباری است
   * @returns {Object} نتیجه اعتبارسنجی
   */
  const validateEmail = (value, options = {}) => {
    const { required = false } = options
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    // بررسی مقدار خالی
    if (!value || value.trim() === '') {
      if (required) {
        return {
          isValid: false,
          message: t('validation.required'),
        }
      }
      return { isValid: true }
    }

    // بررسی فرمت ایمیل
    if (!emailPattern.test(value)) {
      return {
        isValid: false,
        message: t('validation.email'),
      }
    }

    return { isValid: true }
  }

  // ===============================
  // 3. اعتبارسنجی تلفن
  // ===============================

  /**
   * اعتبارسنجی تلفن
   * @param {string} value - شماره تلفن
   * @param {Object} options - گزینه‌های اعتبارسنجی
   * @param {boolean} [options.required=false] - آیا فیلد اجباری است
   * @returns {Object} نتیجه اعتبارسنجی
   */
  const validatePhone = (value, options = {}) => {
    const { required = false } = options
    const phonePattern = /^(\+98|0)?9\d{9}$/

    // بررسی مقدار خالی
    if (!value || value.trim() === '') {
      if (required) {
        return {
          isValid: false,
          message: t('validation.required'),
        }
      }
      return { isValid: true }
    }

    // بررسی فرمت تلفن
    if (!phonePattern.test(value)) {
      return {
        isValid: false,
        message: t('validation.phone'),
      }
    }

    return { isValid: true }
  }

  // ===============================
  // 4. اعتبارسنجی عدد
  // ===============================

  /**
   * اعتبارسنجی عدد
   * @param {string|number} value - مقدار عددی
   * @param {Object} options - گزینه‌های اعتبارسنجی
   * @param {boolean} [options.required=false] - آیا فیلد اجباری است
   * @param {number} [options.min] - حداقل مقدار مجاز
   * @param {number} [options.max] - حداکثر مقدار مجاز
   * @param {number} [options.step] - گام عددی
   * @returns {Object} نتیجه اعتبارسنجی
   */
  const validateNumber = (value, options = {}) => {
    const { required = false, min, max, step } = options

    // بررسی مقدار خالی
    if (value === '' || value === null || value === undefined) {
      if (required) {
        return {
          isValid: false,
          message: t('validation.required'),
        }
      }
      return { isValid: true }
    }

    // تبدیل به عدد
    const num = Number(value)

    // بررسی معتبر بودن عدد
    if (isNaN(num)) {
      return {
        isValid: false,
        message: t('validation.number'),
      }
    }

    // بررسی حداقل مقدار
    if (min !== undefined && num < min) {
      return {
        isValid: false,
        message: t('validation.minValue', { n: min }),
      }
    }

    // بررسی حداکثر مقدار
    if (max !== undefined && num > max) {
      return {
        isValid: false,
        message: t('validation.maxValue', { n: max }),
      }
    }

    // بررسی گام عددی
    if (step !== undefined) {
      const remainder = (num - (min || 0)) % step
      if (remainder !== 0) {
        return {
          isValid: false,
          message: t('validation.step', { step }),
        }
      }
    }

    return { isValid: true }
  }

  // ===============================
  // 5. اعتبارسنجی تاریخ
  // ===============================

  /**
   * اعتبارسنجی تاریخ
   * @param {string|Date|moment.Moment} value - تاریخ
   * @param {Object} options - گزینه‌های اعتبارسنجی
   * @param {boolean} [options.required=false] - آیا فیلد اجباری است
   * @param {string} [options.format='jYYYY/jMM/jDD'] - فرمت تاریخ
   * @returns {Object} نتیجه اعتبارسنجی
   */
  const validateDate = (value, options = {}) => {
    const { required = false, format = 'jYYYY/jMM/jDD' } = options

    // بررسی مقدار خالی
    if (!value) {
      if (required) {
        return {
          isValid: false,
          message: t('validation.required'),
        }
      }
      return { isValid: true }
    }

    // بررسی معتبر بودن تاریخ
    const date = moment(value, format)
    if (!date.isValid()) {
      return {
        isValid: false,
        message: t('validation.date'),
      }
    }

    return { isValid: true }
  }

  // ===============================
  // 6. اعتبارسنجی انتخاب
  // ===============================

  /**
   * اعتبارسنجی انتخاب
   * @param {string|number} value - مقدار انتخاب شده
   * @param {Object} options - گزینه‌های اعتبارسنجی
   * @param {boolean} [options.required=false] - آیا فیلد اجباری است
   * @param {Array} [options.options=[]] - لیست گزینه‌های مجاز
   * @returns {Object} نتیجه اعتبارسنجی
   */
  const validateSelect = (value, options = {}) => {
    const { required = false, options: validOptions = [] } = options

    // بررسی مقدار خالی
    if (value === '' || value === null || value === undefined) {
      if (required) {
        return {
          isValid: false,
          message: t('validation.required'),
        }
      }
      return { isValid: true }
    }

    // بررسی معتبر بودن گزینه
    const isValidOption = validOptions.some((option) => option.value === value || option === value)

    if (!isValidOption) {
      return {
        isValid: false,
        message: t('validation.invalidOption'),
      }
    }

    return { isValid: true }
  }

  return {
    validateText,
    validateEmail,
    validatePhone,
    validateNumber,
    validateDate,
    validateSelect,
  }
}

import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'

// انواع اعلان‌های ممکن
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  DEFAULT: 'default',
}

// تنظیمات پیش‌فرض برای اعلان‌ها
const DEFAULT_OPTIONS = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: true,
}

/**
 * سرویس اعلان‌ها برای نمایش پیام‌های مختلف در سراسر برنامه
 */
class NotificationService {
  constructor(i18n) {
    this.toast = useToast()
    this.i18n = i18n
  }

  /**
   * نمایش اعلان موفقیت
   * @param {string} message - پیام اعلان
   * @param {Object} options - تنظیمات اختیاری
   */
  success(message, options = {}) {
    return this.show(message, { ...options, type: NOTIFICATION_TYPES.SUCCESS })
  }

  /**
   * نمایش خطا
   * @param {string|Error} error - پیام خطا یا شیء خطا
   * @param {Object} options - تنظیمات اختیاری
   */
  error(error, options = {}) {
    const message = error?.message || error || this.i18n.t('notification.error')
    return this.show(message, { ...options, type: NOTIFICATION_TYPES.ERROR })
  }

  /**
   * نمایش هشدار
   * @param {string} message - پیام هشدار
   * @param {Object} options - تنظیمات اختیاری
   */
  warning(message, options = {}) {
    return this.show(message, { ...options, type: NOTIFICATION_TYPES.WARNING })
  }

  /**
   * نمایش اطلاعیه
   * @param {string} message - پیام اطلاعیه
   * @param {Object} options - تنظیمات اختیاری
   */
  info(message, options = {}) {
    return this.show(message, { ...options, type: NOTIFICATION_TYPES.INFO })
  }

  /**
   * نمایش اعلان با تنظیمات دلخواه
   * @param {string} message - پیام اعلان
   * @param {Object} options - تنظیمات اعلان
   */
  show(message, options = {}) {
    if (!message) return

    const { type = NOTIFICATION_TYPES.DEFAULT, ...toastOptions } = options

    // استفاده از تنظیمات پیش‌فرض و ترکیب با تنظیمات ارسالی
    const mergedOptions = {
      ...DEFAULT_OPTIONS,
      ...toastOptions,
      type,
    }

    // نمایش اعلان با استفاده از vue-toastification
    return this.toast(message, mergedOptions)
  }

  /**
   * پاک کردن همه اعلان‌ها
   */
  clear() {
    this.toast.clear()
  }

  /**
   * نمایش دیالوگ تایید
   * @param {string} message - پیام تایید
   * @param {Object} options - تنظیمات دیالوگ
   * @returns {Promise<boolean>} - نتیجه تایید
   */
  async confirm(message, options = {}) {
    // استفاده از دیالوگ پیش‌فرض مرورگر
    return window.confirm(message)
  }

  /**
   * نمایش آلرت ساده
   * @param {string} message - پیام آلرت
   */
  alert(message) {
    window.alert(message)
  }
}

// ایجاد یک نمونه از سرویس
let notificationServiceInstance = null

// این تابع باید در داخل کامپوننت‌ها استفاده شود
export const useNotification = () => {
  const i18n = useI18n()

  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService(i18n)
  } else {
    // به‌روزرسانی نمونه i18n در صورت تغییر
    notificationServiceInstance.i18n = i18n
  }

  return notificationServiceInstance
}

export default {
  install: (app) => {
    // استفاده از provide/inject برای دسترسی به i18n
    app.config.globalProperties.$notification = {
      // متدهای سرویس را به صورت lazy اجرا می‌کنیم تا i18n در زمان فراخوانی در دسترس باشد
      success: (message, options) => {
        const i18n = app.config.globalProperties.$i18n
        const service = new NotificationService(i18n)
        return service.success(message, options)
      },
      error: (error, options) => {
        const i18n = app.config.globalProperties.$i18n
        const service = new NotificationService(i18n)
        return service.error(error, options)
      },
      warning: (message, options) => {
        const i18n = app.config.globalProperties.$i18n
        const service = new NotificationService(i18n)
        return service.warning(message, options)
      },
      info: (message, options) => {
        const i18n = app.config.globalProperties.$i18n
        const service = new NotificationService(i18n)
        return service.info(message, options)
      },
      show: (message, options) => {
        const i18n = app.config.globalProperties.$i18n
        const service = new NotificationService(i18n)
        return service.show(message, options)
      },
      clear: () => {
        const service = new NotificationService({ t: (key) => key })
        return service.clear()
      },
      confirm: (message, options) => {
        const i18n = app.config.globalProperties.$i18n
        const service = new NotificationService(i18n)
        return service.confirm(message, options)
      },
      alert: (message) => {
        const service = new NotificationService({ t: (key) => key })
        return service.alert(message)
      },
    }

    // ارائه سرویس برای استفاده با inject
    app.provide('notification', app.config.globalProperties.$notification)
  },
}

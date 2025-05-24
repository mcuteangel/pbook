// src/plugins/i18n.js
import { createI18n } from 'vue-i18n'
import messages from '@/locales' // مسیر messages رو نسبت به این فایل تنظیم می‌کنیم

const i18n = createI18n({
  legacy: false,
  locale: 'fa', // زبان پیش‌فرض
  fallbackLocale: 'en', // زبان جایگزین در صورت نبود ترجمه
  messages, // پیام‌های ترجمه شده
})

export default i18n

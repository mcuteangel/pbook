// src/plugins/i18n.js
import { createI18n } from 'vue-i18n'
import fa from '@/locales/fa'
import en from '@/locales/en'

const i18n = createI18n({
  legacy: false,
  locale: 'fa', // زبان پیش‌فرض
  fallbackLocale: 'en', // زبان جایگزین در صورت نبود ترجمه
  messages: {
    fa,
    en,
  },
})

export default i18n

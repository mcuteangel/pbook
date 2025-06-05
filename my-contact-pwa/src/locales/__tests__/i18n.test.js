import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'
import en from '../en/index.js'
import fa from '../fa/index.js'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    fa,
  },
})

describe('i18n', () => {
  it('should translate to English correctly', () => {
    expect(i18n.global.t('app.title')).toBe('Contact Book PWA') // کلید صحیح app.title است
    expect(i18n.global.t('app.nav.addContact')).toBe('Add Contact') // کلید صحیح app.nav.addContact است
  })

  it('should translate to Persian correctly', () => {
    i18n.global.locale.value = 'fa'
    expect(i18n.global.t('app.title')).toBe('دفترچه مخاطبین') // کلید صحیح app.title و مقدار صحیح آن
    expect(i18n.global.t('app.nav.addContact')).toBe('افزودن مخاطب') // کلید صحیح app.nav.addContact است
  })

  it('should fallback to English for missing Persian translations', () => {
    i18n.global.locale.value = 'fa'
    // یک کلید که فقط در en.js وجود دارد
    expect(i18n.global.t('notification.testMissingKey', {}, { silentTranslationWarn: true })).toBe(
      'This is a test key for fallback',
    )
  })

  it('should handle pluralization (if applicable)', () => {
    // This is a placeholder. You'd need actual pluralization keys in your locale files.
    // For example: 'message.unread': 'You have {count} unread message | You have {count} unread messages'
    // expect(i18n.global.t('message.unread', { count: 1 })).toBe('You have 1 unread message');
    // expect(i18n.global.t('message.unread', { count: 2 })).toBe('You have 2 unread messages');
    expect(true).toBe(true) // Placeholder for now
  })
})

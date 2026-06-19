import { createI18n } from 'vue-i18n'
import { en, vi } from '../i18n'

export const createTestI18n = (messages: Record<string, unknown> = {}) =>
  createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'vi',
    messages: {
      en: {
        ...en,
        ...messages,
      },
      vi,
    },
  })

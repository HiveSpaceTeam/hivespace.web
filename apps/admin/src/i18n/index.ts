import { createI18n } from 'vue-i18n'
import { CULTURE_TEXT, en as enShared, vi as viShared } from '@hivespace/shared'

// Import English translation files
import enAdmins from './locales/en/admins.json'
import enUsers from './locales/en/users.json'
import enPages from './locales/en/pages.json'
import enBackendErrors from './locales/en/backend-errors.json'
import enLayout from './locales/en/layout.json'
import enNotification from './locales/en/notification.json'

// Import Vietnamese translation files
import viAdmins from './locales/vi/admins.json'
import viUsers from './locales/vi/users.json'
import viPages from './locales/vi/pages.json'
import viBackendErrors from './locales/vi/backend-errors.json'
import viLayout from './locales/vi/layout.json'
import viNotification from './locales/vi/notification.json'

// Merge translations for each language
const en = {
  ...enShared,
  admins: enAdmins,
  users: enUsers,
  pages: enPages,
  backendErrors: enBackendErrors,
  notification: enNotification,
  ...enLayout, // Merges sidebar and header keys at root level
}

const vi = {
  ...viShared,
  admins: viAdmins,
  users: viUsers,
  pages: viPages,
  backendErrors: viBackendErrors,
  notification: viNotification,
  ...viLayout,
}

const i18n = createI18n({
  legacy: false,
  locale: CULTURE_TEXT.VIETNAMESE, // default locale
  fallbackLocale: CULTURE_TEXT.ENGLISH,
  messages: {
    [CULTURE_TEXT.VIETNAMESE]: vi,
    [CULTURE_TEXT.ENGLISH]: en,
  },
})

export default i18n

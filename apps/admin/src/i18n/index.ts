import { createI18n } from 'vue-i18n'
import { CULTURE_TEXT, en as enShared, vi as viShared } from '@hivespace/shared'

// Import English translation files
import enAdmins from './locales/en/admins.json'
import enUsers from './locales/en/users.json'
import enBackendErrors from './locales/en/backend-errors.json'
import enLayout from './locales/en/layout.json'
import enNotification from './locales/en/notification.json'
import enCommon from './locales/en/common.json'
import enAccounts from './locales/en/accounts.json'
import enBuyers from './locales/en/buyers.json'
import enAuditLog from './locales/en/audit-log.json'
import enDashboard from './locales/en/dashboard.json'
import enMerchants from './locales/en/merchants.json'
import enConfiguration from './locales/en/configuration.json'
import enIcons from './locales/en/icons.json'

// Import Vietnamese translation files
import viAdmins from './locales/vi/admins.json'
import viUsers from './locales/vi/users.json'
import viBackendErrors from './locales/vi/backend-errors.json'
import viLayout from './locales/vi/layout.json'
import viNotification from './locales/vi/notification.json'
import viCommon from './locales/vi/common.json'
import viAccounts from './locales/vi/accounts.json'
import viBuyers from './locales/vi/buyers.json'
import viAuditLog from './locales/vi/audit-log.json'
import viDashboard from './locales/vi/dashboard.json'
import viMerchants from './locales/vi/merchants.json'
import viConfiguration from './locales/vi/configuration.json'
import viIcons from './locales/vi/icons.json'

// Merge translations for each language
const en = {
  ...enShared,
  ...enLayout, // Merges sidebar and header keys at root level
  common: {
    ...enShared.common,
    ...enCommon,
  },
  admins: enAdmins,
  users: enUsers,
  backendErrors: enBackendErrors,
  notification: enNotification,
  accounts: enAccounts,
  buyers: enBuyers,
  auditLog: enAuditLog,
  dashboard: enDashboard,
  merchants: enMerchants,
  configuration: enConfiguration,
  icons: enIcons,
}

const vi = {
  ...viShared,
  ...viLayout,
  common: {
    ...viShared.common,
    ...viCommon,
  },
  admins: viAdmins,
  users: viUsers,
  backendErrors: viBackendErrors,
  notification: viNotification,
  accounts: viAccounts,
  buyers: viBuyers,
  auditLog: viAuditLog,
  dashboard: viDashboard,
  merchants: viMerchants,
  configuration: viConfiguration,
  icons: viIcons,
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

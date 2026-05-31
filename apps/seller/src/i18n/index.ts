import { createI18n } from 'vue-i18n'
import { CULTURE_TEXT, en as sharedEn, vi as sharedVi } from '@hivespace/shared'

// Import English translation files
import enCommon from './locales/en/common.json'
import enPages from './locales/en/pages.json'
import enBackendErrors from './locales/en/backend-errors.json'
import enRegisterStore from './locales/en/register-store.json'
import enVerifyEmail from './locales/en/verifyEmail.json'
import enVerifyEmailCallback from './locales/en/verifyEmailCallback.json'
import enProduct from './locales/en/product.json'
import enCoupon from './locales/en/coupon.json'
import enOrder from './locales/en/order.json'
import enNotification from './locales/en/notification.json'
import enAuth from './locales/en/auth.json'

// Import Vietnamese translation files
import viCommon from './locales/vi/common.json'
import viPages from './locales/vi/pages.json'
import viBackendErrors from './locales/vi/backend-errors.json'
import viRegisterStore from './locales/vi/register-store.json'
import viVerifyEmail from './locales/vi/verifyEmail.json'
import viVerifyEmailCallback from './locales/vi/verifyEmailCallback.json'
import viProduct from './locales/vi/product.json'
import viCoupon from './locales/vi/coupon.json'
import viOrder from './locales/vi/order.json'
import viNotification from './locales/vi/notification.json'
import viAuth from './locales/vi/auth.json'

// Merge translations for each language
const en = {
  ...sharedEn,
  common: {
    ...sharedEn.common,
    ...enCommon,
  },
  pages: enPages,
  backendErrors: enBackendErrors,
  registerStore: enRegisterStore,
  verifyEmail: enVerifyEmail,
  verifyEmailCallback: enVerifyEmailCallback,
  product: enProduct,
  coupon: enCoupon,
  order: enOrder,
  notification: enNotification,
  auth: enAuth,
}

const vi = {
  ...sharedVi,
  common: {
    ...sharedVi.common,
    ...viCommon,
  },
  product: viProduct,
  pages: viPages,
  backendErrors: viBackendErrors,
  registerStore: viRegisterStore,
  verifyEmail: viVerifyEmail,
  verifyEmailCallback: viVerifyEmailCallback,
  coupon: viCoupon,
  order: viOrder,
  notification: viNotification,
  auth: viAuth,
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

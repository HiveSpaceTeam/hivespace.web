import { createI18n } from 'vue-i18n'
import { CULTURE_TEXT, en as enShared, vi as viShared } from '@hivespace/shared'

// Import English storefront files
import enCommon from './locales/en/common.json'
import enAddress from './locales/en/address.json'
import enProfilePage from './locales/en/profile-page.json'
import enOrdersPage from './locales/en/orders-page.json'
import enCart from './locales/en/cart.json'
import enCheckout from './locales/en/checkout.json'
import enFooter from './locales/en/footer.json'
import enCategories from './locales/en/categories.json'
import enProductDetail from './locales/en/productDetail.json'

import enPayment from './locales/en/payment.json'
import enNotification from './locales/en/notification.json'
import enOrders from './locales/en/orders.json'
import enAuth from './locales/en/auth.json'

// Import Vietnamese storefront files
import viCommon from './locales/vi/common.json'
import viAddress from './locales/vi/address.json'
import viProfilePage from './locales/vi/profile-page.json'
import viOrdersPage from './locales/vi/orders-page.json'
import viCart from './locales/vi/cart.json'
import viCheckout from './locales/vi/checkout.json'
import viFooter from './locales/vi/footer.json'
import viCategories from './locales/vi/categories.json'
import viPayment from './locales/vi/payment.json'
import viProductDetail from './locales/vi/productDetail.json'
import viNotification from './locales/vi/notification.json'
import viOrders from './locales/vi/orders.json'
import viAuth from './locales/vi/auth.json'


const en = {
  ...enShared,
  notification: enNotification,
  checkout: enCheckout,
  payment: enPayment,
  orders: enOrders,
  auth: enAuth,
  storefront: {
    ...enCommon,
    address: enAddress,
    profilePage: enProfilePage,
    ordersPage: enOrdersPage,
    cart: enCart,
    footer: enFooter,
    categoriesList: enCategories,
    productDetail: enProductDetail,
  },
}

const vi = {
  ...viShared,
  notification: viNotification,
  checkout: viCheckout,
  payment: viPayment,
  orders: viOrders,
  auth: viAuth,
  storefront: {
    ...viCommon,
    address: viAddress,
    profilePage: viProfilePage,
    ordersPage: viOrdersPage,
    cart: viCart,
    footer: viFooter,
    categoriesList: viCategories,
    productDetail: viProductDetail,
  },
}

const i18n = createI18n({
  legacy: false,
  locale: CULTURE_TEXT.VIETNAMESE,
  fallbackLocale: CULTURE_TEXT.ENGLISH,
  messages: {
    [CULTURE_TEXT.VIETNAMESE]: vi,
    [CULTURE_TEXT.ENGLISH]: en,
  },
})

export default i18n

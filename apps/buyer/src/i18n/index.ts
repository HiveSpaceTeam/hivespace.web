import { createI18n } from 'vue-i18n'
import { CULTURE_TEXT, en as enShared, vi as viShared } from '@hivespace/shared'

// Import English storefront files
import enGeneral from './locales/en/general.json'
import enCart from './locales/en/cart.json'
import enCheckout from './locales/en/checkout.json'
import enFooter from './locales/en/footer.json'
import enCategories from './locales/en/categories.json'
import enProductDetail from './locales/en/productDetail.json'

import enPayment from './locales/en/payment.json'
import enNotification from './locales/en/notification.json'
import enOrders from './locales/en/orders.json'

// Import Vietnamese storefront files
import viGeneral from './locales/vi/general.json'
import viCart from './locales/vi/cart.json'
import viCheckout from './locales/vi/checkout.json'
import viFooter from './locales/vi/footer.json'
import viCategories from './locales/vi/categories.json'
import viPayment from './locales/vi/payment.json'
import viProductDetail from './locales/vi/productDetail.json'
import viNotification from './locales/vi/notification.json'
import viOrders from './locales/vi/orders.json'


const en = {
    ...enShared,
    notification: enNotification,
    checkout: enCheckout,
    payment: enPayment,
    orders: enOrders,
    storefront: {
        ...enGeneral,
        cart: enCart,
        footer: enFooter,
        categoriesList: enCategories,
        productDetail: enProductDetail
    }
}

const vi = {
    ...viShared,
    notification: viNotification,
    checkout: viCheckout,
    payment: viPayment,
    orders: viOrders,
    storefront: {
        ...viGeneral,
        cart: viCart,
        footer: viFooter,
        categoriesList: viCategories,
        productDetail: viProductDetail
    }
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

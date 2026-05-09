import { createRouter, createWebHistory } from 'vue-router'
import { ServerError, Maintenance, NotFound, useAuth } from '@hivespace/shared'
import i18n from '@/i18n'

declare module 'vue-router' {
  interface RouteMeta {
    titleKey?: string
    allowAnonymous?: boolean
    layout?: string
  }
}

const devDemoRoutes =
  import.meta.env.DEV
    ? (await import('@hivespace/demo')).demoRoutes.map((route) => ({
        ...route,
        meta: { ...route.meta, allowAnonymous: true },
      }))
    : []

const routes = [
  {
    path: '/callback/logout',
    name: 'LogoutCallback',
    component: () => import('@/pages/Callback/LogoutCallback.vue'),
    meta: { allowAnonymous: true },
  },
  {
    path: '/callback/login',
    name: 'Callback',
    component: () => import('@/pages/Callback/LoginCallback.vue'),
    meta: { allowAnonymous: true },
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home/HomePage.vue'),
    meta: { titleKey: 'storefront.pageTitle.home', allowAnonymous: true },
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/pages/Cart/CartPage.vue'),
    meta: { titleKey: 'storefront.pageTitle.cart', layout: 'none' },
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/pages/Checkout/CheckoutPage.vue'),
    meta: { titleKey: 'storefront.pageTitle.checkout', layout: 'none' },
  },
  {
    path: '/product',
    name: 'Product',
    component: () => import('@/pages/Product/ProductDetail.vue'),
    meta: { titleKey: 'storefront.pageTitle.product', allowAnonymous: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/Profile/ProfilePage.vue'),
    meta: { titleKey: 'storefront.pageTitle.profile' },
  },
  {
    path: '/profile/address',
    name: 'ProfileAddress',
    component: () => import('@/pages/Profile/AddressPage.vue'),
    meta: { titleKey: 'storefront.pageTitle.address' },
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/pages/Profile/OrdersPage.vue'),
    meta: { titleKey: 'storefront.pageTitle.orders' },
  },
  {
    path: '/account/orders/:id',
    name: 'OrderDetail',
    component: () => import('@/pages/Account/OrderDetailPage.vue'),
    meta: { titleKey: 'storefront.pageTitle.orderDetail' },
  },
  {
    path: '/server-error',
    name: 'ServerError',
    component: ServerError,
    meta: { titleKey: 'storefront.pageTitle.serverError', allowAnonymous: true },
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: Maintenance,
    meta: { titleKey: 'storefront.pageTitle.maintenance', allowAnonymous: true },
  },
  {
    path: '/payment/result',
    name: 'PaymentResult',
    component: () => import('@/pages/Payment/PaymentResultPage.vue'),
    meta: { titleKey: 'storefront.pageTitle.paymentResult', allowAnonymous: true, layout: 'none' },
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/pages/Notifications/NotificationsView.vue'),
    meta: { titleKey: 'storefront.pageTitle.notifications' },
  },
  ...devDemoRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { titleKey: 'storefront.pageTitle.notFound', allowAnonymous: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes,
})

router.beforeEach(async (to, _from, next) => {
  document.title = to.meta.titleKey ? i18n.global.t(to.meta.titleKey) : 'HiveSpace'
  if (to.meta.allowAnonymous) {
    next()
    return
  }
  const { getCurrentUser, login } = useAuth()
  const user = await getCurrentUser()
  if (!user) {
    next(false)
    await login()
    return
  }
  next()
})

export default router

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
    path: '/signin',
    name: 'SignIn',
    component: () => import('@/pages/Auth/SignInPage.vue'),
    meta: { titleKey: 'auth.signIn.title', allowAnonymous: true, layout: 'none' },
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import('@/pages/Auth/SignUpPage.vue'),
    meta: { titleKey: 'auth.register.title', allowAnonymous: true, layout: 'none' },
  },
  {
    path: '/auth/google/link',
    name: 'GoogleLink',
    component: () => import('@/pages/Auth/GoogleLinkPage.vue'),
    meta: { titleKey: 'auth.googleLink.title', allowAnonymous: true, layout: 'none' },
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: () => import('@/pages/VerifyEmailPage.vue'),
    meta: { titleKey: 'verifyEmail.title', allowAnonymous: true, layout: 'none' },
  },
  {
    path: '/verify-email-callback',
    name: 'VerifyEmailCallback',
    component: () => import('@/pages/VerifyEmailCallbackPage.vue'),
    meta: { titleKey: 'verifyEmailCallback.title', allowAnonymous: true, layout: 'none' },
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
    component: () => import('@/pages/Product/ProductDetailPage.vue'),
    meta: { titleKey: 'storefront.pageTitle.product', allowAnonymous: true },
  },
  {
    path: '/profile',
    name: 'BuyerProfile',
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
    meta: { titleKey: 'storefront.pageTitle.serverError', allowAnonymous: true, layout: 'none' },
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: Maintenance,
    meta: { titleKey: 'storefront.pageTitle.maintenance', allowAnonymous: true, layout: 'none' },
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
    component: () => import('@/pages/Notifications/NotificationsPage.vue'),
    meta: { titleKey: 'storefront.pageTitle.notifications' },
  },
  ...devDemoRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { titleKey: 'storefront.pageTitle.notFound', allowAnonymous: true, layout: 'none' },
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
  const { getCurrentUser } = useAuth()
  const user = await getCurrentUser()
  if (!user) {
    next({
      path: '/signin',
      query: { returnUrl: to.fullPath },
    })
    return
  }
  next()
})

export default router

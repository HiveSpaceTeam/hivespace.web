import { createRouter, createWebHistory } from 'vue-router'
import { useAuth, Maintenance, NotFound, ServerError } from '@hivespace/shared'
import type { RouteRecordRaw } from 'vue-router'
import i18n from '@/i18n'

declare module 'vue-router' {
  interface RouteMeta {
    titleKey?: string
    allowAnonymous?: boolean
    layout?: string
  }
}

const buildDemoRoutes = (demoRoutes: RouteRecordRaw[]): RouteRecordRaw[] =>
  demoRoutes.map((route): RouteRecordRaw => {
    // Override the icons route to use local component
    if (route.path === '/demo' && route.children) {
      const children = route.children.map((child: RouteRecordRaw) => {
        if (child.path === 'icons') {
          return {
            ...child,
            component: () => import('@/pages/IconsPage.vue'),
          } as RouteRecordRaw
        }
        return child
      })

      // If icons route is missing, explicit add it
      if (!children.some((child: RouteRecordRaw) => child.path === 'icons')) {
        children.push({
          path: 'icons',
          name: 'Icons',
          component: () => import('@/pages/IconsPage.vue'),
          meta: { titleKey: 'pages.icons' },
        })
      }

      return {
        ...route,
        component: () => import('@/pages/DemoWrapperPage.vue'),
        children,
      } as RouteRecordRaw
    }
    return { ...route, component: () => import('@/pages/DemoWrapperPage.vue') } as RouteRecordRaw
  })

const devDemoRoutes = import.meta.env.DEV
  ? buildDemoRoutes((await import('@hivespace/demo')).demoRoutes)
  : []

// Single grouped collection for several related routes (compat redirects, error pages,
// maintenance and 404). We keep the same order and meta fields so
// runtime behavior is unchanged. This makes the router easier to scan.
const mainRoutes = [
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
    path: '/verify-email-callback',
    name: 'Verify Email Callback',
    component: () => import('@/pages/VerifyEmailCallbackPage.vue'),
    meta: { titleKey: 'verifyEmailCallback.title', allowAnonymous: true, layout: 'none' },
  },
  {
    path: '/server-error',
    name: 'ServerError',
    component: ServerError,
    meta: { titleKey: 'common.serverError.title', allowAnonymous: true },
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: Maintenance,
    meta: { titleKey: 'common.maintenance.title', allowAnonymous: true },
  },
  {
    path: '/',
    name: 'RootRedirect',
    redirect: {
      path: '/signin',
      query: { returnUrl: '/product/list' },
    },
    meta: { titleKey: 'auth.signIn.title', allowAnonymous: true },
  },
  ...devDemoRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { titleKey: 'common.notFound.title', allowAnonymous: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/product',
      children: [
        {
          path: '',
          redirect: '/product/list',
        },
        {
          path: 'list',
          name: 'List product',
          component: () => import('@/pages/Products/ProductListPage.vue'),
          meta: { titleKey: 'pages.productList' },
        },
        {
          path: 'new',
          name: 'New Product',
          component: () => import('@/pages/Products/UpsertProductPage.vue'),
          meta: { titleKey: 'product.createProduct' },
        },
        {
          path: ':id',
          name: 'Edit Product',
          component: () => import('@/pages/Products/UpsertProductPage.vue'),
          meta: { titleKey: 'product.editProduct' },
        },
      ],
    },
    {
      path: '/orders',
      children: [
        {
          path: '',
          redirect: '/orders/all',
        },
        {
          path: 'all',
          name: 'Order Management',
          component: () => import('@/pages/Orders/OrderManagementPage.vue'),
          meta: { titleKey: 'order.title' },
        },
      ],
    },
    {
      path: '/marketing',
      children: [
        {
          path: '',
          redirect: '/marketing/coupons',
        },
        {
          path: 'coupons',
          name: 'Coupon Management',
          component: () => import('@/pages/Marketing/CouponListPage.vue'),
          meta: { titleKey: 'coupon.title' },
        },
        {
          path: 'coupons/create',
          name: 'Create Coupon',
          component: () => import('@/pages/Marketing/CouponDetailPage.vue'),
          meta: { titleKey: 'coupon.detail.titleCreate' },
        },
        {
          path: 'coupons/detail/:id',
          name: 'Coupon Detail',
          component: () => import('@/pages/Marketing/CouponDetailPage.vue'),
          meta: { titleKey: 'coupon.detail.titleEdit' },
        }
      ],
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: () => import('@/pages/Notifications/NotificationsPage.vue'),
      meta: { titleKey: 'notification.title' },
    },
    {
      path: '/register-seller',
      name: 'Register Seller',
      component: () => import('@/pages/RegisterStorePage.vue'),
      meta: { titleKey: 'registerStore.title' },
    },
    {
      path: '/verify-email',
      name: 'Verify Email',
      component: () => import('@/pages/VerifyEmailPage.vue'),
      meta: { titleKey: 'verifyEmail.title', allowAnonymous: true, layout: 'none' },
    },
    // Grouped block (compat redirects, pages, demo, notFound)
    ...mainRoutes,
  ],
})

export default router

router.beforeEach(async (to, _from, next) => {
  document.title = to.meta.titleKey ? i18n.global.t(to.meta.titleKey) : 'HiveSpace'
  // Let callback/error routes through without auth checks
  if (to.meta.allowAnonymous) {
    next()
    return
  }
  // For other routes, enforce presence of a local user; if missing, route to '/'
  const { getCurrentUser, logout } = useAuth()
  const user = await getCurrentUser()
  if (!user) {
    next({
      path: '/signin',
      query: { returnUrl: to.fullPath },
    })
    return
  }

  if (user.isAdmin() || user.isSystemAdmin()) {
    await logout()
    next({
      path: '/signin',
      query: { error: 'accessDenied' },
    })
    return
  }
  // Check if user is not a seller
  if (!user.isSeller()) {
    // Priority 1: If not seller and email is not verified, redirect to verify-email
    if (!user.profile.email_verified && !to.path.startsWith('/verify-email')) {
      next('/verify-email')
      return
    }

    // Priority 2: If not seller and email is verified, redirect to register-seller
    if (user.profile.email_verified && !to.path.startsWith('/register-seller')) {
      next('/register-seller')
      return
    }
  }

  // If all conditions are met (user is a seller or on correct route), allow navigation
  next()
})

import { useAuth, ServerError, Maintenance, NotFound } from '@hivespace/shared'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import i18n from '@/i18n'

declare module 'vue-router' {
  interface RouteMeta {
    titleKey?: string
    allowAnonymous?: boolean
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
          meta: { titleKey: 'icons.title' },
        })
      }

      return {
        ...route,
        component: () => import('@/pages/DemoWrapper.vue'),
        children,
      } as RouteRecordRaw
    }
    return { ...route, component: () => import('@/pages/DemoWrapper.vue') } as RouteRecordRaw
  })

const devDemoRoutes = import.meta.env.DEV
  ? buildDemoRoutes((await import('@hivespace/demo')).demoRoutes)
  : []

const mainRoutes = [
  {
    path: '/signin',
    name: 'SignIn',
    component: () => import('@/pages/Auth/SignInPage.vue'),
    meta: { titleKey: 'auth.signIn.title', allowAnonymous: true },
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
      query: { returnUrl: '/dashboard' },
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
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/pages/DashboardPage.vue'),
      meta: { titleKey: 'dashboard.title' },
    },
    {
      path: '/merchants',
      name: 'Merchants',
      component: () => import('@/pages/Merchants/MerchantsPage.vue'),
      meta: { titleKey: 'merchants.title' },
    },
    {
      path: '/configuration',
      name: 'Configuration',
      component: () => import('@/pages/Configuration/ConfigurationPage.vue'),
      meta: { titleKey: 'configuration.title' },
    },
    {
      path: '/accounts',
      name: 'Accounts',
      component: () => import('@/pages/Accounts/AccountsPage.vue'),
      meta: { titleKey: 'accounts.title' },
    },
    {
      path: '/buyers',
      name: 'Buyers',
      component: () => import('@/pages/Buyers/BuyersPage.vue'),
      meta: { titleKey: 'buyers.title' },
    },
    {
      path: '/audit-log',
      name: 'Audit Log',
      component: () => import('@/pages/AuditLog/AuditLogPage.vue'),
      meta: { titleKey: 'auditLog.title' },
    },
    {
      path: '/kyc-queue',
      name: 'KycQueue',
      component: () => import('@/pages/KycQueue/KycQueuePage.vue'),
      meta: { titleKey: 'common.kycQueue' },
    },
    {
      path: '/disputes',
      name: 'Disputes',
      component: () => import('@/pages/Disputes/DisputesPage.vue'),
      meta: { titleKey: 'common.disputes' },
    },
    {
      path: '/scheduled-jobs',
      name: 'ScheduledJobs',
      component: () => import('@/pages/ScheduledJobs/ScheduledJobsPage.vue'),
      meta: { titleKey: 'common.scheduledJobs' },
    },
    {
      path: '/account',
      redirect: '/buyers',
    },
    {
      path: '/account/admin-management',
      redirect: '/accounts',
    },
    {
      path: '/account/user-management',
      redirect: '/buyers',
    },
    ...mainRoutes,
  ],
})

export default router

router.beforeEach(async (to, _from, next) => {
  document.title = to.meta.titleKey ? i18n.global.t(to.meta.titleKey) : 'HiveSpace'
  if (to.meta.allowAnonymous) {
    next()
    return
  }

  // Use the composable for auth operations
  const { getCurrentUser, logout } = useAuth()

  const user = await getCurrentUser()
  if (!user) {
    next({
      path: '/signin',
      query: { returnUrl: to.fullPath },
    })
    return
  }
  // Allow access if the user is an admin OR a system admin.
  // Redirect to login when the user is neither.
  if (!user.isAdmin() && !user.isSystemAdmin()) {
    await logout()
    next({
      path: '/signin',
      query: { error: 'accessDenied' },
    })
    return
  }

  next()
})

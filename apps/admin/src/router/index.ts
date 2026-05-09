import { useAuth, ServerError, Maintenance, NotFound, Default } from '@hivespace/shared'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const buildDemoRoutes = (demoRoutes: RouteRecordRaw[]): RouteRecordRaw[] =>
  demoRoutes.map((route): RouteRecordRaw => {
    // Override the icons route to use local component
    if (route.path === '/demo' && route.children) {
      const children = route.children.map((child: RouteRecordRaw) => {
        if (child.path === 'icons') {
          return {
            ...child,
            component: () => import('@/pages/Icons.vue'),
          } as RouteRecordRaw
        }
        return child
      })

      // If icons route is missing, explicit add it
      if (!children.some((child: RouteRecordRaw) => child.path === 'icons')) {
        children.push({
          path: 'icons',
          name: 'Icons',
          component: () => import('@/pages/Icons.vue'),
          meta: { title: 'Icons' },
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
  // Determine post logout redirect path from config (use only the path portion)
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
    path: '/server-error',
    name: 'ServerError',
    component: ServerError,
    meta: { title: 'Server Error', allowAnonymous: true },
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: Maintenance,
    meta: { title: 'Maintenance', allowAnonymous: true },
  },
  {
    path: '/',
    name: 'Default',
    component: Default,
    props: { redirectPath: '/dashboard', showSignUp: false },
    meta: { title: 'HiveSpace - Admin Portal', allowAnonymous: true },
  },
  ...devDemoRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: 'Not Found', allowAnonymous: true },
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
      component: () => import('@/pages/Dashboard.vue'),
      meta: { title: 'Dashboard' },
    },
    {
      path: '/merchants',
      name: 'Merchants',
      component: () => import('@/pages/Merchants/MerchantManagement.vue'),
      meta: { title: 'Merchants' },
    },
    {
      path: '/configuration',
      name: 'Configuration',
      component: () => import('@/pages/Configuration/Configuration.vue'),
      meta: { title: 'Configuration' },
    },
    {
      path: '/account',
      children: [
        {
          path: '',
          redirect: '/account/user-management',
        },
        {
          path: 'user-management',
          name: 'User management',
          component: () => import('@/pages/Accounts/UserManagement.vue'),
          meta: { title: 'User management' },
        },
        {
          path: 'admin-management',
          name: 'Admin management',
          component: () => import('@/pages/Accounts/AdminManagement.vue'),
          meta: { title: 'Admin management' },
        },
      ],
    },
    ...mainRoutes,
  ],
})

export default router

router.beforeEach(async (to, _from, next) => {
  document.title = `${to.meta.title}`
  if (to.meta.allowAnonymous) {
    next()
    return
  }

  // Use the composable for auth operations
  const { getCurrentUser, login, logout } = useAuth()

  const user = await getCurrentUser()
  if (!user) {
    login()
    return
  }
  // Allow access if the user is an admin OR a system admin.
  // Redirect to login when the user is neither.
  if (!user.isAdmin() && !user.isSystemAdmin()) {
    await logout()
    return next(false)
  }

  next()
})

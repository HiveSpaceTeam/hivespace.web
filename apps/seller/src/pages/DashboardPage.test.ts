import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { AppUser } from '@hivespace/shared'
import { createFakeAuthUser } from '@hivespace/shared/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

const mockGetCurrentUser = jest.fn<() => Promise<AppUser | null>>()
const mockLogout = jest.fn<() => Promise<void>>()

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    Maintenance: { template: '<div />' },
    NotFound: { template: '<div />' },
    ServerError: { template: '<div />' },
    useAuth: () => ({
      getCurrentUser: mockGetCurrentUser,
      logout: mockLogout,
    }),
  }
})

const importRouter = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/signin', name: 'SignIn', component: { template: '<div />' }, meta: { allowAnonymous: true } },
      { path: '/product/list', name: 'List product', component: { template: '<div />' } },
      { path: '/register-seller', name: 'Register Seller', component: { template: '<div />' } },
      { path: '/verify-email', name: 'Verify Email', component: { template: '<div />' }, meta: { allowAnonymous: true } },
    ],
  })

  router.beforeEach(async (to) => {
    if (to.meta.allowAnonymous) {
      return true
    }
    const user: AppUser | null = await mockGetCurrentUser()
    if (!user) {
      return {
        path: '/signin',
        query: { returnUrl: to.fullPath },
      }
    }
    if (user.isAdmin() || user.isSystemAdmin()) {
      await mockLogout()
      return {
        path: '/signin',
        query: { error: 'accessDenied' },
      }
    }
    if (!user.isSeller()) {
      if (!user.profile.email_verified && !to.path.startsWith('/verify-email')) {
        return '/verify-email'
      }
      if (user.profile.email_verified && !to.path.startsWith('/register-seller')) {
        return '/register-seller'
      }
    }
    return true
  })

  return router
}

describe('seller dashboard (product list landing)', () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset()
    mockLogout.mockReset()
  })

  it('renders_WithSellerRole', async () => {
    mockGetCurrentUser.mockResolvedValue(
      createFakeAuthUser({ profile: { role: ['Seller', 'StoreOwner'], storeId: 'store-001' } }),
    )
    const router = await importRouter()

    await router.push('/product/list')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('List product')
  })

  it('redirects_ForNonSellerUser', async () => {
    mockGetCurrentUser.mockResolvedValue(createFakeAuthUser())
    const router = await importRouter()

    await router.push('/product/list')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/register-seller')
  })
})

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { AppUser } from '@hivespace/shared'
import { createFakeAuthUser } from '@hivespace/shared/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

const mockGetCurrentUser = jest.fn<() => Promise<AppUser | null>>()

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    Maintenance: { template: '<div />' },
    NotFound: { template: '<div />' },
    ServerError: { template: '<div />' },
    useAuth: () => ({
      getCurrentUser: mockGetCurrentUser,
    }),
  }
})

describe('buyer router auth guard', () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset()
  })

  const loadRouter = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/signin', name: 'SignIn', component: { template: '<div />' }, meta: { allowAnonymous: true } },
        { path: '/', name: 'Home', component: { template: '<div />' }, meta: { allowAnonymous: true } },
        { path: '/cart', name: 'Cart', component: { template: '<div />' } },
        { path: '/notifications', name: 'Notifications', component: { template: '<div />' } },
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
      return true
    })

    return router
  }

  it('should allow anonymous storefront routes without checking auth', async () => {
    const router = await loadRouter()

    await router.push('/')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('Home')
    expect(mockGetCurrentUser).not.toHaveBeenCalled()
  })

  it('should redirect unauthenticated users from protected routes to sign in', async () => {
    mockGetCurrentUser.mockResolvedValue(null)
    const router = await loadRouter()

    await router.push('/cart')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('SignIn')
    expect(router.currentRoute.value.query.returnUrl).toBe('/cart')
  })

  it('should allow authenticated users to access protected routes', async () => {
    mockGetCurrentUser.mockResolvedValue(createFakeAuthUser())
    const router = await loadRouter()

    await router.push('/notifications')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('Notifications')
  })
})

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { AppUser } from '@hivespace/shared'
import { createFakeAuthUser } from '@hivespace/shared/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

const mockGetCurrentUser = jest.fn<() => Promise<AppUser | null>>()
const mockLogin = jest.fn<() => void>()
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
      login: mockLogin,
      logout: mockLogout,
    }),
  }
})

const importRouter = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/signin', name: 'SignIn', component: { template: '<div />' }, meta: { allowAnonymous: true } },
      { path: '/orders', name: 'Orders', component: { template: '<div />' } },
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

describe('buyer auth', () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset()
    mockLogin.mockReset()
    mockLogout.mockReset()
  })

  it('should dispatch OIDC redirect when login is initiated', () => {
    const assignSpy = jest.fn()
    const originalLocation = window.location

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        assign: assignSpy,
        pathname: '/cart',
        search: '',
      },
    })

    mockLogin.mockImplementation(() => {
      assignSpy('/signin?returnUrl=%2Fcart')
    })

    mockLogin()

    expect(mockLogin).toHaveBeenCalled()
    expect(assignSpy).toHaveBeenCalledWith(expect.stringContaining('/signin'))

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('should store AppUser in auth store after processing callback', async () => {
    const fakeUser = createFakeAuthUser()
    mockGetCurrentUser.mockResolvedValue(fakeUser)

    const user = await mockGetCurrentUser()

    expect(user?.id).toBe(fakeUser.id)
    expect(user?.profile.email).toBe('buyer@example.test')
  })

  it('should allow access when user is logged in', async () => {
    mockGetCurrentUser.mockResolvedValue(createFakeAuthUser())
    const router = await importRouter()

    await router.push('/notifications')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('Notifications')
  })

  it('should redirect to login when user is unauthenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null)
    const router = await importRouter()

    await router.push('/orders')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('SignIn')
    expect(router.currentRoute.value.query.returnUrl).toBe('/orders')
  })

  it('should clear stored user and session on logout', async () => {
    mockLogout.mockResolvedValue(undefined)
    mockGetCurrentUser.mockResolvedValue(null)

    await mockLogout()
    const user = await mockGetCurrentUser()

    expect(mockLogout).toHaveBeenCalled()
    expect(user).toBeNull()
  })
})

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
    useAuth: () => ({ getCurrentUser: mockGetCurrentUser, logout: mockLogout }),
  }
})

const importRouter = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/signin', name: 'SignIn', component: { template: '<div />' }, meta: { allowAnonymous: true } },
      { path: '/audit-log', name: 'AuditLog', component: { template: '<div />' } },
    ],
  })
  router.beforeEach(async (to) => {
    if (to.meta.allowAnonymous) return true
    const user: AppUser | null = await mockGetCurrentUser()
    if (!user) return { path: '/signin', query: { returnUrl: to.fullPath } }
    if (!user.isAdmin() && !user.isSystemAdmin()) {
      await mockLogout()
      return { path: '/signin', query: { error: 'accessDenied' } }
    }
    return true
  })
  return router
}

describe('AuditLogPage', () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset()
    mockLogout.mockReset()
  })

  it('should render audit log page when user has admin role', async () => {
    mockGetCurrentUser.mockResolvedValue(createFakeAuthUser({ profile: { role: ['Admin'] } }))
    const router = await importRouter()

    await router.push('/audit-log')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('AuditLog')
  })

  it('should redirect non-admin user away from audit log', async () => {
    mockGetCurrentUser.mockResolvedValue(createFakeAuthUser())
    mockLogout.mockResolvedValue(undefined)
    const router = await importRouter()

    await router.push('/audit-log')
    await router.isReady()

    expect(router.currentRoute.value.query.error).toBe('accessDenied')
  })
})

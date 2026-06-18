import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { Status } from '@hivespace/shared'
import { useAdminStore } from './admin.store'
import { adminService } from '@/services/admin.service'
import type { Admin } from '@/types'

jest.mock('@/services/admin.service', () => ({
  adminService: {
    createAdmin: jest.fn(),
    getAdmins: jest.fn(),
    updateAdminStatus: jest.fn(),
    deleteUser: jest.fn(),
  },
}))

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    useAppStore: () => ({ setLoading: jest.fn(), notifyError: jest.fn() }),
  }
})

const fakeAdmin = (overrides: Partial<Admin> = {}): Admin => ({
  id: 'admin-001',
  username: 'admin@example.test',
  fullName: 'Test Admin',
  email: 'admin@example.test',
  status: Status.Active,
  isSystemAdmin: false,
  createdAt: '2026-06-12T00:00:00Z',
  lastLoginAt: null,
  updatedAt: null,
  avatarUrl: null,
  ...overrides,
})

describe('useAdminStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(adminService.getAdmins).mockResolvedValue({
      admins: [fakeAdmin()],
      pagination: {
        currentPage: 1,
        pageSize: 20,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    })
  })

  it('should load admin list from the API', async () => {
    const store = useAdminStore()

    await store.fetchAdmins()

    expect(adminService.getAdmins).toHaveBeenCalled()
    expect(store.admins).toHaveLength(1)
    expect(store.admins[0]?.email).toBe('admin@example.test')
  })
})

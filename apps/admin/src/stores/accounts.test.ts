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
    jest.mocked(adminService.updateAdminStatus).mockResolvedValue(
      fakeAdmin({ status: Status.Inactive }),
    )
  })

  it('should load accounts from the API', async () => {
    const store = useAdminStore()

    await store.fetchAdmins()

    expect(adminService.getAdmins).toHaveBeenCalled()
    expect(store.admins).toHaveLength(1)
    expect(store.admins[0]?.email).toBe('admin@example.test')
    expect(store.pagination?.totalItems).toBe(1)
  })

  it('should update account status to suspended in the store', async () => {
    jest.mocked(adminService.updateAdminStatus).mockResolvedValue(
      fakeAdmin({ status: Status.Inactive }),
    )
    const store = useAdminStore()
    await store.fetchAdmins()

    await store.toggleAdminStatus('admin-001')

    expect(adminService.updateAdminStatus).toHaveBeenCalledWith('admin-001', false)
    expect(store.admins[0]?.status).toBe(Status.Inactive)
  })

  it('should update account status to active in the store', async () => {
    jest.mocked(adminService.getAdmins).mockResolvedValue({
      admins: [fakeAdmin({ status: Status.Inactive })],
      pagination: {
        currentPage: 1,
        pageSize: 20,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    })
    jest.mocked(adminService.updateAdminStatus).mockResolvedValue(
      fakeAdmin({ status: Status.Active }),
    )
    const store = useAdminStore()
    await store.fetchAdmins()

    await store.toggleAdminStatus('admin-001')

    expect(adminService.updateAdminStatus).toHaveBeenCalledWith('admin-001', true)
    expect(store.admins[0]?.status).toBe(Status.Active)
  })
})

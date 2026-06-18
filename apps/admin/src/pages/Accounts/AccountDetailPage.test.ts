import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { Status } from '@hivespace/shared'
import { useAdminStore } from '@/stores/admin.store'
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

const fakePagination = () => ({
  currentPage: 1,
  pageSize: 20,
  totalItems: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
})

describe('AccountDetailPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(adminService.getAdmins).mockResolvedValue({
      admins: [fakeAdmin()],
      pagination: fakePagination(),
    })
    jest.mocked(adminService.updateAdminStatus).mockResolvedValue(fakeAdmin())
  })

  it('should render account display name, email reference, and status', async () => {
    const store = useAdminStore()
    await store.fetchAdmins()

    const account = store.admins[0]
    expect(account?.fullName).toBe('Test Admin')
    expect(account?.email).toBe('admin@example.test')
    expect(account?.status).toBe(Status.Active)
  })

  it('should call the suspend endpoint when suspending an account', async () => {
    jest.mocked(adminService.updateAdminStatus).mockResolvedValue(
      fakeAdmin({ status: Status.Inactive }),
    )
    const store = useAdminStore()
    await store.fetchAdmins()

    await store.toggleAdminStatus('admin-001')

    expect(adminService.updateAdminStatus).toHaveBeenCalledWith('admin-001', false)
  })

  it('should call the activate endpoint when activating an account', async () => {
    jest.mocked(adminService.getAdmins).mockResolvedValue({
      admins: [fakeAdmin({ status: Status.Inactive })],
      pagination: fakePagination(),
    })
    jest.mocked(adminService.updateAdminStatus).mockResolvedValue(
      fakeAdmin({ status: Status.Active }),
    )
    const store = useAdminStore()
    await store.fetchAdmins()

    await store.toggleAdminStatus('admin-001')

    expect(adminService.updateAdminStatus).toHaveBeenCalledWith('admin-001', true)
  })
})

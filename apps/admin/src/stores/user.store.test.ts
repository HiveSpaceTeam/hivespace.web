import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { Status } from '@hivespace/shared'
import { useUserStore } from './user.store'
import { userService } from '@/services/user.service'
import type { User } from '@/types'

jest.mock('@/services/user.service', () => ({
  userService: {
    getUsers: jest.fn(),
    deleteUser: jest.fn(),
    updateUserStatus: jest.fn(),
  },
}))

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    useAppStore: () => ({ setLoading: jest.fn(), notifyError: jest.fn() }),
  }
})

const fakeUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-001',
  username: 'buyer@example.test',
  fullName: 'Buyer User',
  email: 'buyer@example.test',
  status: Status.Active,
  isSeller: false,
  createdAt: '2026-06-12T00:00:00Z',
  updatedAt: null,
  lastLoginAt: null,
  avatarUrl: '',
  ...overrides,
})

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(userService.getUsers).mockResolvedValue({
      users: [fakeUser()],
      pagination: {
        currentPage: 1,
        pageSize: 20,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    })
    jest.mocked(userService.updateUserStatus).mockResolvedValue(
      fakeUser({ status: Status.Inactive }),
    )
  })

  it('should load users from the API', async () => {
    const store = useUserStore()

    await store.fetchUsers()

    expect(userService.getUsers).toHaveBeenCalled()
    expect(store.users).toHaveLength(1)
    expect(store.users[0]?.email).toBe('buyer@example.test')
    expect(store.pagination?.totalItems).toBe(1)
  })

  it('should update user status to suspended', async () => {
    jest.mocked(userService.updateUserStatus).mockResolvedValue(
      fakeUser({ status: Status.Inactive }),
    )
    const store = useUserStore()
    await store.fetchUsers()

    await store.toggleUserStatus('user-001')

    expect(userService.updateUserStatus).toHaveBeenCalledWith('user-001', false)
    expect(store.users[0]?.status).toBe(Status.Inactive)
  })

  it('should update user status to active', async () => {
    jest.mocked(userService.getUsers).mockResolvedValue({
      users: [fakeUser({ status: Status.Inactive })],
      pagination: { currentPage: 1, pageSize: 20, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    })
    jest.mocked(userService.updateUserStatus).mockResolvedValue(fakeUser({ status: Status.Active }))
    const store = useUserStore()
    await store.fetchUsers()

    await store.toggleUserStatus('user-001')

    expect(userService.updateUserStatus).toHaveBeenCalledWith('user-001', true)
    expect(store.users[0]?.status).toBe(Status.Active)
  })
})

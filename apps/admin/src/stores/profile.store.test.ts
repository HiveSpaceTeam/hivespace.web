import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { useProfileStore } from './profile.store'
import { profileService } from '@/services/profile.service'

jest.mock('@/services/profile.service', () => ({
  profileService: {
    getMyProfile: jest.fn(),
  },
}))

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    useAppStore: () => ({ setLoading: jest.fn(), notifyError: jest.fn() }),
  }
})

describe('useProfileStore (admin)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(profileService.getMyProfile).mockResolvedValue({
      userName: 'admin@example.test',
      fullName: 'Admin User',
      email: 'admin@example.test',
      phoneNumber: null,
      gender: null,
      dateOfBirth: null,
      avatarUrl: null,
    })
  })

  it('should load profile from the API', async () => {
    const store = useProfileStore()

    await store.fetchMyProfile()

    expect(profileService.getMyProfile).toHaveBeenCalled()
    expect(store.myProfile?.userName).toBe('admin@example.test')
  })
})

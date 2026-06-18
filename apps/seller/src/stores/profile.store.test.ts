import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { useProfileStore } from './profile.store'
import { profileService } from '@/services/profile.service'

jest.mock('@/services/profile.service', () => ({
  profileService: {
    getMyProfile: jest.fn(),
  },
}))

// createUserProfileStore calls useAppStore internally (from the shared stores module)
jest.mock('../../../../packages/shared/src/stores', () => ({
  useAppStore: jest.fn(() => ({
    setLoading: jest.fn(),
    notifySuccess: jest.fn(),
    notifyError: jest.fn(),
  })),
}))

const fakeProfile = {
  userName: 'seller001',
  fullName: 'Test Seller',
  phoneNumber: '0901234567',
  email: 'seller@example.com',
  gender: null,
  dateOfBirth: null,
  avatarUrl: null,
}

describe('useProfileStore (seller)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(profileService.getMyProfile).mockResolvedValue(fakeProfile)
  })

  it('should load my profile from the API', async () => {
    const store = useProfileStore()

    const result = await store.fetchMyProfile()

    expect(profileService.getMyProfile).toHaveBeenCalled()
    expect(result.userName).toBe('seller001')
    expect(store.myProfile?.email).toBe('seller@example.com')
  })

  it('should update state when setting my profile', () => {
    const store = useProfileStore()

    store.setMyProfile(fakeProfile)

    expect(store.myProfile?.fullName).toBe('Test Seller')
    expect(store.myProfile?.userName).toBe('seller001')
  })

  it('should null state when clearing my profile', () => {
    const store = useProfileStore()
    store.setMyProfile(fakeProfile)

    store.clearMyProfile()

    expect(store.myProfile).toBeNull()
  })

  it('should have null profile in initial state', () => {
    const store = useProfileStore()
    expect(store.myProfile).toBeNull()
  })
})

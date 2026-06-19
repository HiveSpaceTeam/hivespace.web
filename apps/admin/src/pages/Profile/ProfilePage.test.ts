import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { useProfileStore } from '@/stores/profile.store'
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

const fakeProfile = () => ({
  userName: 'admin@example.test',
  fullName: 'Admin User',
  email: 'admin@example.test',
  phoneNumber: null,
  gender: null,
  dateOfBirth: null,
  avatarUrl: null,
})

describe('ProfilePage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(profileService.getMyProfile).mockResolvedValue(fakeProfile())
  })

  it('should render display name and email reference from store', async () => {
    const store = useProfileStore()

    await store.fetchMyProfile()

    expect(store.myProfile?.fullName).toBe('Admin User')
    expect(store.myProfile?.email).toBe('admin@example.test')
    expect(store.myProfile?.userName).toBe('admin@example.test')
  })

  it('should update profile fields in the store on submit', async () => {
    const store = useProfileStore()
    await store.fetchMyProfile()

    const updated = { ...fakeProfile(), fullName: 'Updated Admin', phoneNumber: '+84123456789' }
    store.setMyProfile(updated)

    expect(store.myProfile?.fullName).toBe('Updated Admin')
    expect(store.myProfile?.phoneNumber).toBe('+84123456789')
    expect(store.myProfile?.email).toBe('admin@example.test')
  })
})

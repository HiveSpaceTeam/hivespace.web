import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { createUserProfileStore } from './createUserProfileStore'
import type { IUserProfileService, MyProfile } from './user-profile.types'

jest.mock('../../stores', () => ({
  useAppStore: jest.fn(() => ({
    setLoading: jest.fn(),
    notifySuccess: jest.fn(),
    notifyError: jest.fn(),
    notifyInfo: jest.fn(),
  })),
}))

const makeProfile = (overrides: Partial<MyProfile> = {}): MyProfile => ({
  userName: 'testuser',
  fullName: 'Test User',
  phoneNumber: '+84123456789',
  email: 'test@example.com',
  gender: 1,
  dateOfBirth: '1990-01-01',
  avatarUrl: null,
  ...overrides,
})

const makeService = (): jest.Mocked<IUserProfileService> => ({
  getMyProfile: jest.fn(),
})

describe('createUserProfileStore', () => {
  let service: jest.Mocked<IUserProfileService>

  beforeEach(() => {
    setActivePinia(createPinia())
    service = makeService()
    service.getMyProfile.mockResolvedValue(makeProfile())
  })

  it('should load profile from the API', async () => {
    const useStore = createUserProfileStore({ service })
    const store = useStore()

    const result = await store.fetchMyProfile()

    expect(service.getMyProfile).toHaveBeenCalled()
    expect(result.userName).toBe('testuser')
    expect(store.myProfile?.email).toBe('test@example.com')
  })

  it('should update state directly when setting profile', () => {
    const useStore = createUserProfileStore({ service })
    const store = useStore()
    const profile = makeProfile({ fullName: 'Updated User' })

    store.setMyProfile(profile)

    expect(store.myProfile?.fullName).toBe('Updated User')
    expect(service.getMyProfile).not.toHaveBeenCalled()
  })

  it('should set state to null when clearing profile', async () => {
    const useStore = createUserProfileStore({ service })
    const store = useStore()
    await store.fetchMyProfile()
    expect(store.myProfile).not.toBeNull()

    store.clearMyProfile()

    expect(store.myProfile).toBeNull()
  })

  it('should set loading via AppStore when fetching profile', async () => {
    const { useAppStore } = await import('../../stores')
    const mockAppStore = { setLoading: jest.fn(), notifySuccess: jest.fn(), notifyError: jest.fn(), notifyInfo: jest.fn() }
    jest.mocked(useAppStore).mockReturnValue(mockAppStore as unknown as ReturnType<typeof useAppStore>)
    const useStore = createUserProfileStore({ service })
    const store = useStore()

    await store.fetchMyProfile()

    expect(mockAppStore.setLoading).toHaveBeenCalledWith(true)
    expect(mockAppStore.setLoading).toHaveBeenCalledWith(false)
  })
})

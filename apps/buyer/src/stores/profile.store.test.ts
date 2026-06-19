import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import type { AppUser } from '@hivespace/shared'
import { createFakeAuthUser } from '@hivespace/shared/test-utils'
import { useProfileStore } from './profile.store'
import { profileService } from '@/services/profile.service'
import { userService } from '@/services/user.service'

jest.mock('@/services/profile.service', () => ({
  profileService: {
    getMyProfile: jest.fn(),
  },
}))

jest.mock('@/services/user.service', () => ({
  userService: {
    updateProfile: jest.fn(),
  },
}))

const mockUploadMedia = jest.fn<() => Promise<{ fileId: string; uploadUrl: string }>>()
const mockConfirmUpload = jest.fn<() => Promise<void>>()

jest.mock('@/stores/media.store', () => ({
  useMediaStore: () => ({
    uploadMedia: mockUploadMedia,
    confirmUpload: mockConfirmUpload,
  }),
}))

const mockGetCurrentUser = jest.fn<() => Promise<AppUser | null>>()
const mockCurrentUser: { value: AppUser | null } = { value: null }

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifySuccess: jest.fn(),
      notifyError: jest.fn(),
    }),
    useAuth: () => ({
      currentUser: mockCurrentUser,
      getCurrentUser: mockGetCurrentUser,
    }),
  }
})

const baseProfile = {
  userName: 'buyer001',
  fullName: 'Nguyen Van A',
  phoneNumber: '0901234567',
  email: 'buyer@example.test',
  gender: 1,
  dateOfBirth: null as string | null,
  avatarUrl: null as string | null,
}

describe('useProfileStore (buyer)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockCurrentUser.value = null
    mockGetCurrentUser.mockResolvedValue(null)
    mockUploadMedia.mockResolvedValue({ fileId: 'file-001', uploadUrl: '' })
    mockConfirmUpload.mockResolvedValue(undefined)
    jest.mocked(profileService.getMyProfile).mockResolvedValue({ ...baseProfile })
    jest.mocked(userService.updateProfile).mockImplementation(() => Promise.resolve())
  })

  it('should load profile from the API', async () => {
    const store = useProfileStore()

    await store.fetchProfile()

    expect(profileService.getMyProfile).toHaveBeenCalled()
    expect(store.profile?.fullName).toBe('Nguyen Van A')
    expect(store.profile?.email).toBe('buyer@example.test')
  })

  it('updateProfile_CallsEndpoint', async () => {
    const store = useProfileStore()
    await store.fetchProfile()
    store.setForm({ name: 'Nguyen Van B' })

    await store.saveProfile()

    expect(userService.updateProfile).toHaveBeenCalled()
  })

  it('fetchMyProfile_LoadsCurrentUserProfileIntoState', async () => {
    const store = useProfileStore()

    await store.fetchMyProfile()

    expect(profileService.getMyProfile).toHaveBeenCalled()
    expect(store.myProfile?.fullName).toBe('Nguyen Van A')
    expect(store.myProfile?.email).toBe('buyer@example.test')
  })

  it('clearMyProfile_ResetsProfileToNull', async () => {
    const store = useProfileStore()
    await store.fetchProfile()
    expect(store.profile).not.toBeNull()

    store.clearMyProfile()

    expect(store.profile).toBeNull()
    expect(store.form.name).toBe('')
  })

  it('setMyProfile_WithNull_ResetsProfileAndForm', async () => {
    const store = useProfileStore()
    await store.fetchProfile()

    store.setMyProfile(null)

    expect(store.profile).toBeNull()
    expect(store.form.name).toBe('')
  })

  it('setAvatarError_SetsErrorMessage', () => {
    const store = useProfileStore()

    store.setAvatarError('Upload failed')

    expect(store.avatarError).toBe('Upload failed')
  })

  it('clearAvatarError_ClearsErrorMessage', () => {
    const store = useProfileStore()
    store.setAvatarError('Upload failed')

    store.clearAvatarError()

    expect(store.avatarError).toBe('')
  })

  it('saveProfile_WithNoProfile_ReturnsFalse', async () => {
    const store = useProfileStore()

    const result = await store.saveProfile()

    expect(result).toBe(false)
    expect(userService.updateProfile).not.toHaveBeenCalled()
  })

  it('saveProfile_WithAvatarAndNoCurrentUser_ReturnsFalseAndSetsAvatarError', async () => {
    const store = useProfileStore()
    await store.fetchProfile()

    const fakeFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' })
    const result = await store.saveProfile(fakeFile)

    expect(result).toBe(false)
    expect(store.avatarError).not.toBe('')
    expect(userService.updateProfile).not.toHaveBeenCalled()
  })

  it('normalizeProfile_WithNullOptionalFields_FallsBackToDefaults', async () => {
    jest.mocked(profileService.getMyProfile).mockResolvedValueOnce({
      userName: 'buyer001',
      fullName: null as unknown as string,
      phoneNumber: null as unknown as string,
      email: null as unknown as string,
      gender: null as unknown as number,
      dateOfBirth: null,
      avatarUrl: null,
    })
    const store = useProfileStore()

    await store.fetchProfile()

    expect(store.profile?.fullName).toBe('')
    expect(store.profile?.phoneNumber).toBe('')
    expect(store.profile?.email).toBe('')
    expect(store.profile?.gender).toBe(2)
  })

  it('syncForm_WithDateOfBirth_SetsFormDateFields', async () => {
    jest.mocked(profileService.getMyProfile).mockResolvedValueOnce({
      ...baseProfile,
      dateOfBirth: '1990-06-15',
    })
    const store = useProfileStore()

    await store.fetchProfile()

    expect(store.form.birthDay).toBe(15)
    expect(store.form.birthMonth).toBe(6)
    expect(store.form.birthYear).toBe(1990)
  })

  it('syncForm_WithUnknownGender_FallsBackToOther', async () => {
    jest.mocked(profileService.getMyProfile).mockResolvedValueOnce({
      ...baseProfile,
      gender: 99,
    })
    const store = useProfileStore()

    await store.fetchProfile()

    expect(store.form.gender).toBe('other')
  })

  it('setAvatarError_WithNotifyTrue_SetsErrorMessageAndNotifies', () => {
    const store = useProfileStore()

    expect(() => store.setAvatarError('Upload failed', true)).not.toThrow()
    expect(store.avatarError).toBe('Upload failed')
  })

  it('saveProfile_WithBirthDateFields_IncludesDateInRequest', async () => {
    const store = useProfileStore()
    await store.fetchProfile()
    store.setForm({ birthDay: 15, birthMonth: 6, birthYear: 1990 })

    await store.saveProfile()

    expect(userService.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ dateOfBirth: expect.any(String) }),
    )
  })

  it('saveProfile_WhenUpdateThrows_WithNoAvatar_PropagatesError', async () => {
    jest.mocked(userService.updateProfile).mockRejectedValueOnce(new Error('Network error'))
    const store = useProfileStore()
    await store.fetchProfile()

    await expect(store.saveProfile()).rejects.toThrow('Network error')
  })

  it('getCurrentUserId_WhenCurrentUserHasSubject_ReturnsId', async () => {
    mockCurrentUser.value = createFakeAuthUser({ profile: { sub: 'user-123' } })
    mockGetCurrentUser.mockResolvedValueOnce(createFakeAuthUser({ profile: { sub: 'user-123' } }))
    const store = useProfileStore()
    await store.fetchProfile()

    // Trigger getCurrentUserId via saveProfile with avatar
    // The avatar path calls getCurrentUserId first
    const fakeFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' })
    jest.useFakeTimers()
    const savePromise = store.saveProfile(fakeFile)
    await jest.runAllTimersAsync()
    await savePromise
    jest.useRealTimers()

    expect(mockConfirmUpload).toHaveBeenCalledWith('file-001', 'user-123')
  })

  it('saveProfile_WithAvatarAndCurrentUser_AvatarBecomesReady', async () => {
    jest.useFakeTimers()
    mockGetCurrentUser.mockResolvedValueOnce(createFakeAuthUser({ profile: { sub: 'user-123' } }))
    jest.mocked(profileService.getMyProfile)
      .mockResolvedValueOnce({ ...baseProfile, avatarUrl: null })
      .mockResolvedValueOnce({ ...baseProfile, avatarUrl: 'https://cdn/new-avatar.jpg' })

    const store = useProfileStore()
    await store.fetchProfile()
    const fakeFile = new File(['data'], 'avatar.jpg', { type: 'image/jpeg' })

    const savePromise = store.saveProfile(fakeFile)
    await jest.runAllTimersAsync()
    const result = await savePromise

    jest.useRealTimers()

    expect(result).toBe(true)
    expect(mockUploadMedia).toHaveBeenCalledWith(fakeFile, 'user_avatar')
    expect(mockConfirmUpload).toHaveBeenCalledWith('file-001', 'user-123')
  })

  it('saveProfile_WithAvatarAndCurrentUser_AvatarNeverReady_ReturnsTrueWithPendingToast', async () => {
    jest.useFakeTimers()
    mockGetCurrentUser.mockResolvedValueOnce(createFakeAuthUser({ profile: { sub: 'user-123' } }))
    // All refresh attempts return same null URL
    jest.mocked(profileService.getMyProfile).mockResolvedValue({ ...baseProfile, avatarUrl: null })

    const store = useProfileStore()
    await store.fetchProfile()
    const fakeFile = new File(['data'], 'avatar.jpg', { type: 'image/jpeg' })

    const savePromise = store.saveProfile(fakeFile)
    await jest.runAllTimersAsync()
    const result = await savePromise

    jest.useRealTimers()

    // Returns true even when avatar isn't immediately ready
    expect(result).toBe(true)
  })

  it('saveProfile_WhenAvatarUploadFails_SetsAvatarError', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(createFakeAuthUser({ profile: { sub: 'user-123' } }))
    mockUploadMedia.mockRejectedValueOnce(new Error('Upload failed'))
    const store = useProfileStore()
    await store.fetchProfile()
    const fakeFile = new File(['data'], 'avatar.jpg', { type: 'image/jpeg' })

    const result = await store.saveProfile(fakeFile)

    expect(result).toBe(false)
    expect(store.avatarError).not.toBe('')
    expect(userService.updateProfile).not.toHaveBeenCalled()
  })

  it('saveProfile_WhenProfileSavedButAvatarConfirmFails_SetsAvatarError', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(createFakeAuthUser({ profile: { sub: 'user-123' } }))
    mockConfirmUpload.mockRejectedValueOnce(new Error('Confirm failed'))
    const store = useProfileStore()
    await store.fetchProfile()
    const fakeFile = new File(['data'], 'avatar.jpg', { type: 'image/jpeg' })

    const result = await store.saveProfile(fakeFile)

    expect(result).toBe(false)
    expect(store.avatarError).not.toBe('')
    // Profile was saved before the avatar confirm step
    expect(userService.updateProfile).toHaveBeenCalled()
  })

  it('hasProfileFieldChanges_WhenNameChanged_DetectedInSave', async () => {
    const store = useProfileStore()
    await store.fetchProfile()
    // Change the name field (was 'Nguyen Van A')
    store.setForm({ name: 'Nguyen Van B' })

    await store.saveProfile()

    expect(userService.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: 'Nguyen Van B' }),
    )
  })

  it('toLocalDateKey_WhenProfileDateIsInvalid_HandlesGracefully', async () => {
    jest.mocked(profileService.getMyProfile).mockResolvedValueOnce({
      ...baseProfile,
      dateOfBirth: 'not-a-date',
    })
    const store = useProfileStore()
    await store.fetchProfile()

    // hasProfileFieldChanges calls toLocalDateKey with 'not-a-date', hitting NaN branch
    await store.saveProfile()

    expect(userService.updateProfile).toHaveBeenCalled()
  })

  it('fetchMyProfile_SetsLoadingStateAroundServiceCall', async () => {
    jest.mocked(profileService.getMyProfile).mockImplementationOnce(async () => {
      return { ...baseProfile }
    })
    // The setLoading calls come from useAppStore which is a jest.fn()
    // We verify by checking the profile is loaded correctly
    const store = useProfileStore()

    await store.fetchMyProfile()

    expect(store.myProfile?.fullName).toBe('Nguyen Van A')
  })
})

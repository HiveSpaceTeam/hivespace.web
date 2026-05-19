import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAppStore, useAuth } from '@hivespace/shared'
import type { MyProfile } from '@hivespace/shared'
import i18n from '@/i18n'
import { profileService } from '@/services/profile.service'
import { userService } from '@/services/user.service'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { useMediaStore } from './media.store'
import type { ProfileFormData, UpdateProfileRequest, UserProfileResponse } from '@/types'
import { GENDER_FROM_API, GENDER_TO_API } from '@/types'

const AVATAR_ENTITY_TYPE = 'user_avatar'
const AVATAR_REFRESH_ATTEMPTS = 5
const AVATAR_REFRESH_DELAY_MS = 1000

const wait = (delay: number) => new Promise((resolve) => window.setTimeout(resolve, delay))

const toLocalDateKey = (value: string | null | undefined) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export const useProfileStore = defineStore('profile', () => {
  const createDefaultForm = (): ProfileFormData => ({
    name: '',
    gender: '',
    birthDay: null,
    birthMonth: null,
    birthYear: null,
  })

  const profile = ref<UserProfileResponse | null>(null)
  const myProfile = profile
  const form = ref<ProfileFormData>(createDefaultForm())
  const avatarError = ref('')
  const { isLoading, run } = useAsyncAction()

  const normalizeProfile = (data: MyProfile): UserProfileResponse => ({
    userName: data.userName,
    fullName: data.fullName ?? '',
    phoneNumber: data.phoneNumber ?? '',
    email: data.email ?? '',
    gender: data.gender ?? 2,
    dateOfBirth: data.dateOfBirth,
    avatarUrl: data.avatarUrl,
  })

  const syncForm = (data: UserProfileResponse) => {
    const dob = data.dateOfBirth ? new Date(data.dateOfBirth) : null
    form.value = {
      name: data.fullName ?? '',
      gender: GENDER_FROM_API[data.gender] ?? 'other',
      birthDay: dob ? dob.getDate() : null,
      birthMonth: dob ? dob.getMonth() + 1 : null,
      birthYear: dob ? dob.getFullYear() : null,
    }
  }

  const setMyProfile = (data: MyProfile | UserProfileResponse | null) => {
    if (!data) {
      profile.value = null
      form.value = createDefaultForm()
      return
    }

    profile.value = normalizeProfile(data)
    syncForm(profile.value)
  }

  const fetchMyProfile = async () => {
    const appStore = useAppStore()
    try {
      appStore.setLoading(true)
      const data = normalizeProfile(await profileService.getMyProfile())
      profile.value = data
      return data
    } finally {
      appStore.setLoading(false)
    }
  }

  const clearMyProfile = () => {
    setMyProfile(null)
  }

  const fetchProfile = async () => {
    await run(async () => {
      profile.value = normalizeProfile(await profileService.getMyProfile())
      syncForm(profile.value)
    })
  }

  const setForm = (data: Partial<ProfileFormData>) => {
    form.value = { ...form.value, ...data }
  }

  const clearAvatarError = () => {
    avatarError.value = ''
  }

  const setAvatarError = (message: string, notify = false) => {
    avatarError.value = message

    if (notify) {
      useAppStore().notifyError(
        i18n.global.t('storefront.profilePage.avatarSaveFailedTitle'),
        message,
      )
    }
  }

  const getCurrentUserId = async (): Promise<string | null> => {
    const { currentUser, getCurrentUser } = useAuth()
    const user = currentUser.value ?? (await getCurrentUser())
    const subject = user?.profile?.sub
    return typeof subject === 'string' && subject.trim() ? subject : null
  }

  const refreshUntilAvatarReady = async (previousAvatarUrl: string | null): Promise<boolean> => {
    for (let attempt = 0; attempt < AVATAR_REFRESH_ATTEMPTS; attempt += 1) {
      await wait(AVATAR_REFRESH_DELAY_MS)

      const refreshedProfile = normalizeProfile(await profileService.getMyProfile())
      profile.value = refreshedProfile
      syncForm(refreshedProfile)

      if (refreshedProfile.avatarUrl && refreshedProfile.avatarUrl !== previousAvatarUrl) {
        return true
      }
    }

    return false
  }

  const hasProfileFieldChanges = (
    currentProfile: UserProfileResponse,
    dateOfBirth: string | null,
  ) =>
    form.value.name !== currentProfile.fullName ||
    GENDER_TO_API[form.value.gender] !== currentProfile.gender ||
    toLocalDateKey(dateOfBirth) !== toLocalDateKey(currentProfile.dateOfBirth)

  const saveProfile = async (avatarFile?: File | null): Promise<boolean> => {
    if (!profile.value) return false
    return await run(async () => {
      const appStore = useAppStore()
      const mediaStore = useMediaStore()
      const hasAvatarChange = Boolean(avatarFile)
      const { birthDay, birthMonth, birthYear } = form.value
      const dateOfBirth =
        birthDay && birthMonth && birthYear
          ? new Date(birthYear, birthMonth - 1, birthDay).toISOString()
          : null
      const previousAvatarUrl = profile.value!.avatarUrl
      const hasProfileChange = hasProfileFieldChanges(profile.value!, dateOfBirth)
      let avatarFileId: string | undefined
      let currentUserId: string | null = null
      let avatarFailureMessage = i18n.global.t('storefront.profilePage.avatarUploadFailed')
      let profileSaved = false

      try {
        if (hasAvatarChange) {
          clearAvatarError()
        }

        if (avatarFile) {
          currentUserId = await getCurrentUserId()

          if (!currentUserId) {
            setAvatarError(i18n.global.t('storefront.profilePage.avatarUnauthenticated'), true)
            return false
          }

          const upload = await mediaStore.uploadMedia(avatarFile, AVATAR_ENTITY_TYPE)
          avatarFileId = upload.fileId
          avatarFailureMessage = i18n.global.t('storefront.profilePage.avatarSaveFailed')
        }

        const request: UpdateProfileRequest = {
          userName: profile.value!.userName,
          fullName: form.value.name,
          phoneNumber: profile.value!.phoneNumber,
          email: profile.value!.email,
          gender: GENDER_TO_API[form.value.gender],
          dateOfBirth,
        }

        if (avatarFileId) {
          request.avatarFileId = avatarFileId
        }

        await userService.updateProfile(request)
        profileSaved = true

        profile.value = {
          ...profile.value!,
          fullName: form.value.name,
          gender: GENDER_TO_API[form.value.gender],
          dateOfBirth,
        }

        if (avatarFileId && currentUserId) {
          avatarFailureMessage = i18n.global.t('storefront.profilePage.avatarUploadFailed')
          await mediaStore.confirmUpload(avatarFileId, currentUserId)
          const avatarReady = await refreshUntilAvatarReady(previousAvatarUrl)
          const toastKey = avatarReady
            ? hasProfileChange
              ? 'storefront.profilePage.profileAndAvatarSaveSuccess'
              : 'storefront.profilePage.avatarSaveSuccess'
            : hasProfileChange
              ? 'storefront.profilePage.profileAndAvatarSavePending'
              : 'storefront.profilePage.avatarSavePending'

          appStore.notifySuccess(i18n.global.t(toastKey))
          clearAvatarError()
          return true
        }

        appStore.notifySuccess(i18n.global.t('storefront.profilePage.saveSuccess'))
        clearAvatarError()
        return true
      } catch (error) {
        if (!hasAvatarChange) {
          throw error
        }

        const message =
          profileSaved && hasProfileChange
            ? i18n.global.t('storefront.profilePage.profileSavedAvatarFailed')
            : avatarFailureMessage

        setAvatarError(message, true)
        return false
      }
    })
  }

  return {
    profile,
    myProfile,
    form,
    avatarError,
    isLoading,
    fetchMyProfile,
    fetchProfile,
    setMyProfile,
    setForm,
    setAvatarError,
    clearAvatarError,
    saveProfile,
    clearMyProfile,
  }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAppStore } from '@hivespace/shared'
import i18n from '@/i18n'
import { userService } from '@/services/user.service'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { ProfileFormData, UserProfileResponse } from '@/types'
import { GENDER_FROM_API, GENDER_TO_API } from '@/types'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<UserProfileResponse | null>(null)
  const form = ref<ProfileFormData>({
    name: '',
    gender: '',
    birthDay: null,
    birthMonth: null,
    birthYear: null,
  })
  const { isLoading, run } = useAsyncAction()

  const fetchProfile = async () => {
    await run(async () => {
      profile.value = await userService.getProfile()

      const dob = profile.value.dateOfBirth ? new Date(profile.value.dateOfBirth) : null
      form.value = {
        name: profile.value.fullName ?? '',
        gender: GENDER_FROM_API[profile.value.gender] ?? 'other',
        birthDay: dob ? dob.getDate() : null,
        birthMonth: dob ? dob.getMonth() + 1 : null,
        birthYear: dob ? dob.getFullYear() : null,
      }
    })
  }

  const setForm = (data: Partial<ProfileFormData>) => {
    form.value = { ...form.value, ...data }
  }

  const saveProfile = async () => {
    if (!profile.value) return
    await run(async () => {
      const { birthDay, birthMonth, birthYear } = form.value
      const dateOfBirth =
        birthDay && birthMonth && birthYear
          ? new Date(birthYear, birthMonth - 1, birthDay).toISOString()
          : null

      await userService.updateProfile({
        userName: profile.value!.userName,
        fullName: form.value.name,
        phoneNumber: profile.value!.phoneNumber,
        email: profile.value!.email,
        gender: GENDER_TO_API[form.value.gender],
        dateOfBirth,
      })

      profile.value = {
        ...profile.value!,
        fullName: form.value.name,
        gender: GENDER_TO_API[form.value.gender],
        dateOfBirth,
      }

      useAppStore().notifySuccess(i18n.global.t('storefront.profilePage.saveSuccess'))
    })
  }

  return { profile, form, isLoading, fetchProfile, setForm, saveProfile }
})

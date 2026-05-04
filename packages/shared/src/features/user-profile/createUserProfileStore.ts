import { useAppStore } from '../../stores'
import { defineStore, type StoreDefinition } from 'pinia'
import { ref, type Ref } from 'vue'
import type { IUserProfileService, MyProfile } from './user-profile.types'

export interface UserProfileStoreReturn {
  myProfile: Ref<MyProfile | null>
  setMyProfile: (profile: MyProfile | null) => void
  fetchMyProfile: () => Promise<MyProfile>
  clearMyProfile: () => void
}

export interface UserProfileStoreState {
  myProfile: MyProfile | null
}

export type UserProfileStoreDefinition = StoreDefinition<
  'profile',
  UserProfileStoreState,
  Record<never, never>,
  Omit<UserProfileStoreReturn, 'myProfile'>
>

export interface UserProfileStoreOptions {
  service: IUserProfileService
}

export const createUserProfileStore = (
  options: UserProfileStoreOptions,
): UserProfileStoreDefinition => {
  const { service } = options

  return defineStore('profile', () => {
    const myProfile = ref<MyProfile | null>(null)

    const setMyProfile = (profile: MyProfile | null) => {
      myProfile.value = profile
    }

    const fetchMyProfile = async () => {
      const appStore = useAppStore()
      try {
        appStore.setLoading(true)
        const profile = await service.getMyProfile()
        myProfile.value = profile
        return profile
      } finally {
        appStore.setLoading(false)
      }
    }

    const clearMyProfile = () => {
      myProfile.value = null
    }

    return {
      myProfile,
      setMyProfile,
      fetchMyProfile,
      clearMyProfile,
    }
  }) as unknown as UserProfileStoreDefinition
}

import { createUserProfileStore } from '@hivespace/shared'
import { profileService } from '@/services/profile.service'
export const useProfileStore = createUserProfileStore({
  service: profileService,
})

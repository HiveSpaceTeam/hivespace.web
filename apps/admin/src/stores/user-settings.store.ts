import { createUserSettingsStore } from '@hivespace/shared'
import { userSettingsService } from '@/services/user-settings.service'

export const useUserSettingsStore = createUserSettingsStore({
  service: userSettingsService,
})

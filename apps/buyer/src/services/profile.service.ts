import { createUserProfileService } from '@hivespace/shared'
import { buildApiUrl } from '@/config'
import { apiService } from './api'

export const profileService = createUserProfileService({
  apiService,
  buildApiUrl,
})

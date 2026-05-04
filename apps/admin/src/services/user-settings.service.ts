import { createUserSettingsService } from '@hivespace/shared'
import { apiService } from './api'
import { buildApiUrl } from '@/config'

export const userSettingsService = createUserSettingsService({
  apiService,
  buildApiUrl,
})

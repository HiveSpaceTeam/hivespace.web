import { createMediaUploadService } from '@hivespace/shared'
import { buildApiUrl } from '@/config'
import { apiService } from './api'

export const mediaService = createMediaUploadService({
  apiService,
  buildApiUrl,
})

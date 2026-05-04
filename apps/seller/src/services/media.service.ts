import { createMediaUploadService } from '@hivespace/shared'
import { apiService } from './api'
import { buildApiUrl } from '@/config'

export const mediaService = createMediaUploadService({
  apiService,
  buildApiUrl,
})

import { createMediaUploadStore } from '@hivespace/shared'
import { mediaService } from '@/services/media.service'

export const useMediaStore = createMediaUploadStore({
  service: mediaService,
})

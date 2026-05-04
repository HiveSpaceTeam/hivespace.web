import { defineStore, type StoreDefinition } from 'pinia'
import { ref, type Ref } from 'vue'
import type {
  IMediaUploadService,
  PresignUrlRequest,
  PresignUrlResponse,
} from './media-upload.types'

export interface MediaUploadStoreReturn {
  isLoading: Ref<boolean>
  presignUrl: (request: PresignUrlRequest) => Promise<PresignUrlResponse>
  confirmUpload: (id: string, entityId: string) => Promise<void>
  uploadMedia: (file: File, entityType: string, entityId?: string) => Promise<PresignUrlResponse>
}

export interface MediaUploadStoreState {
  isLoading: boolean
}

export type MediaUploadStoreDefinition = StoreDefinition<
  'media',
  MediaUploadStoreState,
  Record<never, never>,
  Pick<MediaUploadStoreReturn, 'presignUrl' | 'confirmUpload' | 'uploadMedia'>
>

export interface MediaUploadStoreOptions {
  service: IMediaUploadService
}

export const createMediaUploadStore = (
  options: MediaUploadStoreOptions,
): MediaUploadStoreDefinition => {
  const { service } = options

  return defineStore('media', () => {
    const isLoading = ref(false)

    const presignUrl = async (request: PresignUrlRequest): Promise<PresignUrlResponse> => {
      isLoading.value = true

      try {
        return await service.presignUrl(request)
      } finally {
        isLoading.value = false
      }
    }

    const confirmUpload = async (id: string, entityId: string): Promise<void> => {
      isLoading.value = true

      try {
        await service.confirmUpload(id, entityId)
      } finally {
        isLoading.value = false
      }
    }

    const uploadMedia = async (
      file: File,
      entityType: string,
      entityId?: string,
    ): Promise<PresignUrlResponse> => {
      isLoading.value = true

      try {
        const presignResponse = await service.presignUrl({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
          entityType,
          entityId,
        })

        await service.uploadToBlob(presignResponse.uploadUrl, file)

        return presignResponse
      } finally {
        isLoading.value = false
      }
    }

    return {
      isLoading,
      presignUrl,
      confirmUpload,
      uploadMedia,
    }
  }) as unknown as MediaUploadStoreDefinition
}

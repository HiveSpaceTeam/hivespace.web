import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import type { ApiRequestService, BuildApiUrl } from '../service.types'
import type {
  IMediaUploadService,
  PresignUrlRequest,
  PresignUrlResponse,
} from './media-upload.types'

const MEDIA_ENDPOINTS = {
  PRESIGN_URL: '/media/presign-url',
  CONFIRM_UPLOAD: (id: string) => `/media/${id}/confirm`,
} as const

interface BlobUploadClient {
  put(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<unknown>
}

export interface MediaUploadServiceOptions {
  apiService: ApiRequestService
  buildApiUrl: BuildApiUrl
  uploadClient?: BlobUploadClient
}

export const createMediaUploadService = (
  options: MediaUploadServiceOptions,
): IMediaUploadService => {
  const { apiService, buildApiUrl, uploadClient = axios } = options

  return {
    presignUrl: (request: PresignUrlRequest): Promise<PresignUrlResponse> =>
      apiService.post<PresignUrlResponse>(buildApiUrl(MEDIA_ENDPOINTS.PRESIGN_URL), request),
    confirmUpload: (id: string, entityId: string): Promise<void> =>
      apiService.post<void>(buildApiUrl(MEDIA_ENDPOINTS.CONFIRM_UPLOAD(id)), { entityId }),
    async uploadToBlob(url: string, file: File): Promise<void> {
      await uploadClient.put(url, file, {
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type,
        },
      })
    },
  }
}

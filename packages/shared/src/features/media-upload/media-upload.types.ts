export interface PresignUrlRequest {
  fileName: string
  contentType: string
  fileSize: number
  entityType: string
  entityId?: string
}

export interface PresignUrlResponse {
  fileId: string
  uploadUrl: string
  storagePath: string
  expiresAt: string
}

export interface IMediaUploadService {
  presignUrl(request: PresignUrlRequest): Promise<PresignUrlResponse>
  confirmUpload(id: string, entityId: string): Promise<void>
  uploadToBlob(url: string, file: File): Promise<void>
}

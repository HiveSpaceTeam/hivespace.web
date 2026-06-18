import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { createMediaUploadStore } from './createMediaUploadStore'
import type { IMediaUploadService, PresignUrlRequest, PresignUrlResponse } from './media-upload.types'

const makePresignResponse = (): PresignUrlResponse => ({
  fileId: 'file-001',
  uploadUrl: 'https://blob.example.com/upload',
  storagePath: 'uploads/file-001.jpg',
  expiresAt: '2026-01-01T01:00:00Z',
})

const makeService = (): jest.Mocked<IMediaUploadService> => ({
  presignUrl: jest.fn(),
  confirmUpload: jest.fn(),
  uploadToBlob: jest.fn(),
})

describe('createMediaUploadStore', () => {
  let service: jest.Mocked<IMediaUploadService>

  beforeEach(() => {
    setActivePinia(createPinia())
    service = makeService()
    service.presignUrl.mockResolvedValue(makePresignResponse())
    service.confirmUpload.mockResolvedValue(undefined)
    service.uploadToBlob.mockResolvedValue(undefined)
  })

  it('should call service and return response for presign URL', async () => {
    const useStore = createMediaUploadStore({ service })
    const store = useStore()

    const request: PresignUrlRequest = {
      fileName: 'photo.jpg',
      contentType: 'image/jpeg',
      fileSize: 12345,
      entityType: 'product',
    }
    const result = await store.presignUrl(request)

    expect(service.presignUrl).toHaveBeenCalledWith(request)
    expect(result.fileId).toBe('file-001')
    expect(store.isLoading).toBe(false)
  })

  it('should request presign URL then upload to blob', async () => {
    const useStore = createMediaUploadStore({ service })
    const store = useStore()
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })

    const result = await store.uploadMedia(file, 'product')

    expect(service.presignUrl).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: 'photo.jpg', entityType: 'product' }),
    )
    expect(service.uploadToBlob).toHaveBeenCalledWith(
      makePresignResponse().uploadUrl,
      file,
    )
    expect(result.fileId).toBe('file-001')
    expect(store.isLoading).toBe(false)
  })

  it('should call service with file ID and entity ID when confirming upload', async () => {
    const useStore = createMediaUploadStore({ service })
    const store = useStore()

    await store.confirmUpload('file-001', 'entity-999')

    expect(service.confirmUpload).toHaveBeenCalledWith('file-001', 'entity-999')
    expect(store.isLoading).toBe(false)
  })

  it('should set loading during upload execution', async () => {
    const useStore = createMediaUploadStore({ service })
    const store = useStore()

    let loadingDuringUpload = false
    service.presignUrl.mockImplementation(async () => {
      loadingDuringUpload = store.isLoading
      return makePresignResponse()
    })

    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    await store.uploadMedia(file, 'product')

    expect(loadingDuringUpload).toBe(true)
    expect(store.isLoading).toBe(false)
  })
})

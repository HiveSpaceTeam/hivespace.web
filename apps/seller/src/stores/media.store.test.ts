import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { useMediaStore } from './media.store'
import { mediaService } from '@/services/media.service'

jest.mock('@/services/media.service', () => ({
  mediaService: {
    presignUrl: jest.fn(),
    uploadToBlob: jest.fn(),
    confirmUpload: jest.fn(),
  },
}))

const fakePresign = {
  fileId: 'file-001',
  uploadUrl: 'https://storage.example.com/upload',
  storagePath: 'media/file-001',
  expiresAt: '2026-12-31T23:59:59Z',
}

describe('useMediaStore (seller)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(mediaService.presignUrl).mockResolvedValue(fakePresign)
    jest.mocked(mediaService.uploadToBlob).mockResolvedValue(undefined)
    jest.mocked(mediaService.confirmUpload).mockResolvedValue(undefined)
  })

  it('should request presign URL and upload to blob', async () => {
    const store = useMediaStore()
    const file = new File(['data'], 'photo.png', { type: 'image/png' })

    const result = await store.uploadMedia(file, 'store-logo')

    expect(mediaService.presignUrl).toHaveBeenCalledWith(
      expect.objectContaining({ entityType: 'store-logo', fileName: 'photo.png' }),
    )
    expect(mediaService.uploadToBlob).toHaveBeenCalledWith(fakePresign.uploadUrl, file)
    expect(result.fileId).toBe('file-001')
  })

  it('should set loading to false after upload completes', async () => {
    const store = useMediaStore()
    const file = new File(['data'], 'photo.png', { type: 'image/png' })

    await store.uploadMedia(file, 'store-logo')

    expect(store.isLoading).toBe(false)
  })

  it('should call confirm upload service with correct arguments', async () => {
    const store = useMediaStore()

    await store.confirmUpload('file-001', 'store-001')

    expect(mediaService.confirmUpload).toHaveBeenCalledWith('file-001', 'store-001')
    expect(store.isLoading).toBe(false)
  })

  it('should return presign response', async () => {
    const store = useMediaStore()

    const result = await store.presignUrl({
      fileName: 'photo.png',
      contentType: 'image/png',
      fileSize: 1024,
      entityType: 'store-logo',
    })

    expect(result.fileId).toBe('file-001')
    expect(result.uploadUrl).toBe(fakePresign.uploadUrl)
  })
})

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { useMediaStore } from './media.store'
import { mediaService } from '@/services/media.service'

jest.mock('@/services/media.service', () => ({
  mediaService: {
    presignUrl: jest.fn(),
    confirmUpload: jest.fn(),
    uploadToBlob: jest.fn(),
  },
}))

describe('useMediaStore (buyer)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(mediaService.presignUrl).mockResolvedValue({
      uploadUrl: 'https://fake-presign.test/upload',
      fileId: 'file-001',
      storagePath: 'user_avatar/file-001',
      expiresAt: '2026-06-14T12:00:00Z',
    })
    jest.mocked(mediaService.uploadToBlob).mockResolvedValue(undefined)
    jest.mocked(mediaService.confirmUpload).mockResolvedValue(undefined)
  })

  it('should request presign URL then confirm upload', async () => {
    const store = useMediaStore()
    const fakeFile = new File(['content'], 'avatar.png', { type: 'image/png' })

    const result = await store.uploadMedia(fakeFile, 'user_avatar')

    expect(mediaService.presignUrl).toHaveBeenCalledWith(
      expect.objectContaining({ entityType: 'user_avatar' }),
    )
    expect(mediaService.uploadToBlob).toHaveBeenCalledWith(
      'https://fake-presign.test/upload',
      fakeFile,
    )
    expect(result.fileId).toBe('file-001')
  })

  it('should reset upload state after completion', async () => {
    const store = useMediaStore()
    const fakeFile = new File(['content'], 'avatar.png', { type: 'image/png' })

    await store.uploadMedia(fakeFile, 'user_avatar')

    expect(store.isLoading).toBe(false)
  })
})

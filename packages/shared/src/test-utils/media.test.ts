import { describe, expect, it } from '@jest/globals'
import { createFakePresignResponse, simulateUploadConfirm } from './media'

describe('createFakePresignResponse', () => {
  it('returnsCorrectShape', () => {
    const response = createFakePresignResponse()
    expect(response).toHaveProperty('url')
    expect(response).toHaveProperty('uploadRef')
    expect(typeof response.url).toBe('string')
    expect(typeof response.uploadRef).toBe('string')
  })

  it('withOverrides_MergesProperties', () => {
    const response = createFakePresignResponse({ url: 'https://custom.example.com/upload' })
    expect(response.url).toBe('https://custom.example.com/upload')
    expect(response.uploadRef).toBe('fake-ref-001')
  })

  it('defaultUrl_IsValidFakeUrl', () => {
    const response = createFakePresignResponse()
    expect(response.url).toContain('fake-presign.test')
  })
})

describe('simulateUploadConfirm', () => {
  it('returnsConfirmedTrue', () => {
    const result = simulateUploadConfirm('ref-001')
    expect(result.confirmed).toBe(true)
  })

  it('returnsMediaIdMatchingUploadRef', () => {
    const result = simulateUploadConfirm('ref-abc')
    expect(result.mediaId).toBe('ref-abc')
  })
})

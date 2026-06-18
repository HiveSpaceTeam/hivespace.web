export const createFakePresignResponse = (overrides: object = {}) => ({
  url: 'https://fake-presign.test/upload',
  uploadRef: 'fake-ref-001',
  ...overrides,
})

export const simulateUploadConfirm = (uploadRef: string) => ({
  confirmed: true,
  mediaId: uploadRef,
})

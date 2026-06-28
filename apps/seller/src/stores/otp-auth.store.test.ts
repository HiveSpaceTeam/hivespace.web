import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import type { RequestOtpSignInResponse } from '@hivespace/shared'
import { useOtpAuthStore } from './otp-auth.store'

var mockRequestOtp = jest.fn<
  (request: unknown) => Promise<RequestOtpSignInResponse>
>()

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    createOtpAuthService: jest.fn(() => ({
      requestOtp: (request: RequestOtpSignInResponse | unknown) =>
        mockRequestOtp(request as never),
      verifyOtp: jest.fn(),
    })),
  }
})

jest.mock('@/config', () => ({
  config: {
    auth: {
      app: 'seller',
      gatewayBaseUrl: 'http://localhost:5000',
    },
  },
}))

describe('useOtpAuthStore (seller)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
    mockRequestOtp.mockResolvedValue({
      challengeToken: 'challenge-001',
      expiresAt: '2026-12-01T00:10:00Z',
      canResendAt: '2026-12-01T00:01:00Z',
    })
  })

  it('should store challengeToken expiresAt and canResendAt after requesting OTP', async () => {
    const store = useOtpAuthStore()

    await store.requestOtp({
      email: 'seller@example.test',
      returnUrl: '/product/list',
      culture: 'vi',
    })

    expect(store.email).toBe('seller@example.test')
    expect(store.challengeToken).toBe('challenge-001')
    expect(store.expiresAt).toBe('2026-12-01T00:10:00Z')
    expect(store.canResendAt).toBe('2026-12-01T00:01:00Z')
  })

  it('should block code entry when no active challenge exists', () => {
    const store = useOtpAuthStore()

    expect(store.hasActiveChallenge).toBe(false)
  })

  it('should reset OTP state when returning to password sign in', async () => {
    const store = useOtpAuthStore()

    await store.requestOtp({
      email: 'seller@example.test',
    })

    store.resetOtpState()

    expect(store.email).toBe('')
    expect(store.challengeToken).toBeNull()
    expect(store.expiresAt).toBeNull()
    expect(store.canResendAt).toBeNull()
    expect(store.requestError).toBeNull()
    expect(store.hasActiveChallenge).toBe(false)
  })

  it('should replace prior challenge state after resend succeeds', async () => {
    const store = useOtpAuthStore()

    await store.requestOtp({
      email: 'seller@example.test',
    })

    mockRequestOtp.mockResolvedValueOnce({
      challengeToken: 'challenge-002',
      expiresAt: '2026-12-01T00:20:00Z',
      canResendAt: '2026-12-01T00:11:00Z',
    })

    await store.requestOtp({
      email: 'seller@example.test',
    })

    expect(store.challengeToken).toBe('challenge-002')
    expect(store.expiresAt).toBe('2026-12-01T00:20:00Z')
    expect(store.canResendAt).toBe('2026-12-01T00:11:00Z')
  })
})

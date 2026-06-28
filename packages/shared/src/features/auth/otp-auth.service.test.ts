import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createOtpAuthService } from './otp-auth.service'

describe('createOtpAuthService', () => {
  const fetchMock = jest.fn<typeof fetch>()

  beforeEach(() => {
    fetchMock.mockReset()
    global.fetch = fetchMock
  })

  afterEach(() => {
    fetchMock.mockReset()
  })

  it('should post OTP requests to the accounts endpoint with JSON headers', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: jest.fn(() => 'application/json'),
      },
      json: jest.fn().mockResolvedValue({
        challengeToken: 'challenge-token',
        expiresAt: '2026-12-01T00:10:00Z',
        canResendAt: '2026-12-01T00:01:00Z',
      }),
    } as Response)

    const service = createOtpAuthService('https://gateway.test/api')
    const response = await service.requestOtp({
      email: 'buyer@example.com',
      app: 'buyer',
      returnUrl: '/checkout',
      culture: 'vi',
    })

    expect(fetchMock).toHaveBeenCalledWith('https://gateway.test/api/v1/accounts/otp/request', {
      method: 'POST',
      body: JSON.stringify({
        email: 'buyer@example.com',
        app: 'buyer',
        returnUrl: '/checkout',
        culture: 'vi',
      }),
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    expect(response).toEqual({
      challengeToken: 'challenge-token',
      expiresAt: '2026-12-01T00:10:00Z',
      canResendAt: '2026-12-01T00:01:00Z',
    })
  })

  it('should strip trailing slashes and nested api paths when verifying OTP', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: jest.fn(() => 'application/json; charset=utf-8'),
      },
      json: jest.fn().mockResolvedValue({
        redirectUrl: '/account',
        expiresAt: '2026-12-01T00:10:00Z',
        refreshExpiresAt: '2026-12-07T00:00:00Z',
      }),
    } as Response)

    const service = createOtpAuthService('https://gateway.test/api/v1/')
    const response = await service.verifyOtp({
      challengeToken: 'challenge-token',
      code: '123456',
      app: 'seller',
    })

    expect(fetchMock).toHaveBeenCalledWith('https://gateway.test/api/v1/accounts/otp/verify', {
      method: 'POST',
      body: JSON.stringify({
        challengeToken: 'challenge-token',
        code: '123456',
        app: 'seller',
      }),
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    expect(response.redirectUrl).toBe('/account')
  })

  it('should return undefined for no-content responses', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
      headers: {
        get: jest.fn(),
      },
    } as Response)

    const service = createOtpAuthService('https://gateway.test')
    const response = await service.verifyOtp({
      challengeToken: 'challenge-token',
      code: '123456',
      app: 'buyer',
    })

    expect(response).toBeUndefined()
  })

  it('should throw parsed JSON errors from the API', async () => {
    const errorBody = {
      errors: [{ code: 'OtpInvalid', message: 'OTP invalid' }],
    }

    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      headers: {
        get: jest.fn(() => 'application/json'),
      },
      json: jest.fn().mockResolvedValue(errorBody),
    } as Response)

    const service = createOtpAuthService('https://gateway.test')

    await expect(
      service.requestOtp({
        email: 'buyer@example.com',
        app: 'buyer',
      }),
    ).rejects.toEqual(errorBody)
  })

  it('should throw a generic error when a non-json response fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      headers: {
        get: jest.fn(() => 'text/plain'),
      },
    } as Response)

    const service = createOtpAuthService('https://gateway.test')

    await expect(
      service.verifyOtp({
        challengeToken: 'challenge-token',
        code: '123456',
        app: 'buyer',
      }),
    ).rejects.toThrow('Request failed with status 503')
  })
})

import type {
  RequestOtpSignInRequest,
  RequestOtpSignInResponse,
  VerifyOtpSignInRequest,
  VerifyOtpSignInResponse,
} from './otp-auth.types'

const normalizeGatewayBaseUrl = (gatewayBaseUrl: string): string =>
  gatewayBaseUrl.replace(/\/api(\/.*)?$/, '').replace(/\/+$/, '')

const buildAccountUrl = (gatewayBaseUrl: string, path: string): string =>
  `${normalizeGatewayBaseUrl(gatewayBaseUrl)}/api/v1/accounts${path}`

const requestJson = async <TResponse>(
  gatewayBaseUrl: string,
  path: string,
  init: RequestInit,
): Promise<TResponse> => {
  const response = await fetch(buildAccountUrl(gatewayBaseUrl, path), {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  })

  if (response.status === 204) {
    return undefined as TResponse
  }

  const contentType = response.headers.get('content-type') ?? ''
  const data = contentType.includes('application/json') ? await response.json() : undefined

  if (!response.ok) {
    throw data ?? new Error(`Request failed with status ${response.status}`)
  }

  return data as TResponse
}

export interface OtpAuthService {
  requestOtp: (request: RequestOtpSignInRequest) => Promise<RequestOtpSignInResponse>
  verifyOtp: (request: VerifyOtpSignInRequest) => Promise<VerifyOtpSignInResponse>
}

export const createOtpAuthService = (gatewayBaseUrl: string): OtpAuthService => ({
  requestOtp: (request) =>
    requestJson<RequestOtpSignInResponse>(gatewayBaseUrl, '/otp/request', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  verifyOtp: (request) =>
    requestJson<VerifyOtpSignInResponse>(gatewayBaseUrl, '/otp/verify', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
})

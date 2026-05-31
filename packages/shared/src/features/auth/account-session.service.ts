import type {
  RefreshSessionRequest,
  RegisterAccountRequest,
  SessionResponse,
  SignInRequest,
} from '../../types'
import { getCookie } from '../../utils/cookie'

const csrfHeaderName = 'X-HiveSpace-CSRF'
const csrfCookieName = 'HiveSpace.Csrf'

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

export interface AccountSessionService {
  login: (request: SignInRequest) => Promise<SessionResponse>
  register: (request: RegisterAccountRequest) => Promise<SessionResponse>
  refreshSession: (request: RefreshSessionRequest) => Promise<SessionResponse>
  logout: (csrfTokenOverride?: string | null) => Promise<void>
}

export const createAccountSessionService = (gatewayBaseUrl: string): AccountSessionService => {
  const csrfHeaders = (csrfTokenOverride?: string | null): Record<string, string> => {
    const csrfToken = csrfTokenOverride ?? getCookie(csrfCookieName)
    return csrfToken ? { [csrfHeaderName]: csrfToken } : {}
  }

  return {
    login: (request: SignInRequest) =>
      requestJson<SessionResponse>(gatewayBaseUrl, '/login', {
        method: 'POST',
        body: JSON.stringify(request),
      }),

    register: (request: RegisterAccountRequest) =>
      requestJson<SessionResponse>(gatewayBaseUrl, '/register', {
        method: 'POST',
        body: JSON.stringify(request),
      }),

    refreshSession: (request: RefreshSessionRequest) =>
      requestJson<SessionResponse>(gatewayBaseUrl, '/session/refresh', {
        method: 'POST',
        headers: csrfHeaders(),
        body: JSON.stringify(request),
      }),

    logout: async (csrfTokenOverride?: string | null) => {
      await requestJson<void>(gatewayBaseUrl, '/logout', {
        method: 'POST',
        headers: csrfHeaders(csrfTokenOverride),
        body: JSON.stringify({}),
      })
    },
  }
}

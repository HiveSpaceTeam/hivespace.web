import type {
  ConfirmGoogleLinkRequest,
  RefreshSessionRequest,
  RegisterAccountRequest,
  RegisterAccountResponse,
  SessionResponse,
  SignInRequest,
  StartGoogleAuthRequest,
} from '../../types'
import { getCookie } from '../../utils/cookie'

interface RegisterAccountApiResponse {
  email: string
  app: RegisterAccountResponse['app']
  canResendAt?: string
}

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
  register: (request: RegisterAccountRequest) => Promise<RegisterAccountResponse>
  refreshSession: (request: RefreshSessionRequest) => Promise<SessionResponse>
  startGoogleAuth: (request: StartGoogleAuthRequest) => void
  confirmGoogleLink: (request: ConfirmGoogleLinkRequest) => Promise<SessionResponse>
  cancelGoogleLink: (linkToken: string) => Promise<void>
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
      requestJson<RegisterAccountApiResponse>(gatewayBaseUrl, '/register', {
        method: 'POST',
        body: JSON.stringify(request),
      }).then((response) => ({
        maskedEmail: response.email,
        app: response.app,
        canResendAt: response.canResendAt,
      })),

    refreshSession: (request: RefreshSessionRequest) =>
      requestJson<SessionResponse>(gatewayBaseUrl, '/session/refresh', {
        method: 'POST',
        headers: csrfHeaders(),
        body: JSON.stringify(request),
      }),

    startGoogleAuth: (request: StartGoogleAuthRequest) => {
      const url = new URL(buildAccountUrl(gatewayBaseUrl, '/external/google/challenge'))
      url.searchParams.set('app', request.app)

      if (request.returnUrl) {
        url.searchParams.set('returnUrl', request.returnUrl)
      }

      if (request.culture) {
        url.searchParams.set('culture', String(request.culture))
      }

      window.location.assign(url.toString())
    },

    confirmGoogleLink: (request: ConfirmGoogleLinkRequest) =>
      requestJson<SessionResponse>(gatewayBaseUrl, '/external/google/link', {
        method: 'POST',
        headers: csrfHeaders(request.linkToken),
        body: JSON.stringify(request),
      }),

    cancelGoogleLink: async (linkToken: string) => {
      await requestJson<void>(gatewayBaseUrl, '/external/google/link', {
        method: 'DELETE',
        headers: csrfHeaders(linkToken),
      })
    },

    logout: async (csrfTokenOverride?: string | null) => {
      await requestJson<void>(gatewayBaseUrl, '/logout', {
        method: 'POST',
        headers: csrfHeaders(csrfTokenOverride),
        body: JSON.stringify({}),
      })
    },
  }
}

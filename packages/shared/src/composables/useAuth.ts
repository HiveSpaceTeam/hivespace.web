import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  AppUser,
  AuthApp,
  ConfirmGoogleLinkRequest,
  CultureText,
  GoogleAuthApp,
  RegisterAccountRequest,
  SessionResponse,
  SignInRequest,
  StartGoogleAuthRequest,
} from '../types'
import { CULTURE_TEXT } from '../types'
import { toAppUserFromSession } from '../types'
import { createAccountSessionService } from '../features/auth'
import type { AccountSessionService } from '../features/auth'
import { deleteCookie, getCookie } from '../utils/cookie'
import { normalizeFrontendRedirect } from '../utils/auth-navigation'

export interface AuthConfig {
  app: AuthApp
  gatewayBaseUrl: string
}

interface LogoutOptions {
  csrfToken?: string | null
}

let currentConfig: AuthConfig | null = null
let accountSessionService: AccountSessionService | null = null
let isInitialized = false

const currentUser = ref<AppUser | null>(null)
const csrfToken = ref<string | null>(null)
const expiresAt = ref<string | null>(null)
const refreshExpiresAt = ref<string | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

const clearSessionState = (): void => {
  currentUser.value = null
  csrfToken.value = null
  expiresAt.value = null
  refreshExpiresAt.value = null
  deleteCookie('HiveSpace.Csrf')
}

const cleanupOldOidcStorage = (): void => {
  if (typeof window === 'undefined') return

  const cleanupStore = (storage: Storage) => {
    Object.keys(storage)
      .filter((key) => key.startsWith('oidc.') || key === 'hivespace.refreshed_user')
      .forEach((key) => storage.removeItem(key))
  }

  try {
    cleanupStore(window.localStorage)
    cleanupStore(window.sessionStorage)
  } catch {
    // Storage may be unavailable in private browsing or SSR-like contexts.
  }
}

const applySession = (session: SessionResponse): AppUser => {
  csrfToken.value = session.csrfToken
  expiresAt.value = session.expiresAt
  refreshExpiresAt.value = session.refreshExpiresAt ?? null
  currentUser.value = toAppUserFromSession(session.user, session.expiresAt, session.refreshExpiresAt)
  return currentUser.value
}

const currentCulture = (i18nLocale: { value?: unknown } | null): CultureText => {
  if (i18nLocale?.value) {
    return i18nLocale.value as CultureText
  }

  const cookieCulture = getCookie('culture')
  return cookieCulture === CULTURE_TEXT.ENGLISH ? CULTURE_TEXT.ENGLISH : CULTURE_TEXT.VIETNAMESE
}

const isGoogleAuthApp = (app: AuthApp | undefined): app is GoogleAuthApp =>
  app === 'buyer' || app === 'seller'

export const initializeAuth = (config: AuthConfig): void => {
  currentConfig = config
  accountSessionService = createAccountSessionService(config.gatewayBaseUrl)
  isInitialized = true
  cleanupOldOidcStorage()
}

export const resetAuth = (): void => {
  currentConfig = null
  accountSessionService = null
  isInitialized = false
  clearSessionState()
  isLoading.value = false
  error.value = null
}

export const isAuthInitialized = (): boolean => isInitialized && accountSessionService !== null

export const useAuth = () => {
  let i18nLocale: { value?: unknown } | null = null
  try {
    const { locale } = useI18n()
    i18nLocale = locale
  } catch {
    // Called outside component setup.
  }

  const isConfigured = computed(() => isAuthInitialized())
  const isAuthenticated = computed(() => currentUser.value !== null)

  const assertConfigured = (): AccountSessionService => {
    if (!accountSessionService || !currentConfig) {
      error.value = 'Auth not initialized'
      throw new Error('Auth not initialized')
    }

    return accountSessionService
  }

  const getCurrentUser = async (): Promise<AppUser | null> => {
    if (currentUser.value) return currentUser.value
    if (!accountSessionService || !currentConfig) return null

    const cookieToken = getCookie('HiveSpace.Csrf')
    if (!cookieToken) return null

    try {
      error.value = null
      const session = await accountSessionService.refreshSession({ app: currentConfig.app })
      return applySession(session)
    } catch (err) {
      clearSessionState()
      error.value = err instanceof Error ? err.message : 'Session refresh failed'
      return null
    }
  }

  const refreshSession = async (app?: AuthApp): Promise<AppUser | null> => {
    const service = assertConfigured()
    const targetApp = app ?? currentConfig?.app
    if (!targetApp) return null

    try {
      isLoading.value = true
      error.value = null
      const session = await service.refreshSession({ app: targetApp })
      return applySession(session)
    } catch (err) {
      clearSessionState()
      error.value = err instanceof Error ? err.message : 'Session refresh failed'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const login = async (request?: SignInRequest): Promise<SessionResponse | void> => {
    const service = assertConfigured()
    const authConfig = currentConfig
    if (!authConfig) return

    if (!request) {
      const returnUrl = normalizeFrontendRedirect(
        `${window.location.pathname}${window.location.search}`,
        '/',
      )
      window.location.assign(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`)
      return
    }

    try {
      isLoading.value = true
      error.value = null
      const session = await service.login({
        ...request,
        app: request.app ?? authConfig.app,
        culture: request.culture ?? currentCulture(i18nLocale),
      })
      applySession(session)
      return session
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (
    request?: RegisterAccountRequest,
  ): Promise<SessionResponse | void> => {
    const service = assertConfigured()

    if (!request) {
      window.location.assign('/signup')
      return
    }

    try {
      isLoading.value = true
      error.value = null
      const session = await service.register({
        ...request,
        culture: request.culture ?? currentCulture(i18nLocale),
      })
      applySession(session)
      return session
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const startGoogleAuth = (request?: Partial<StartGoogleAuthRequest>): void => {
    const service = assertConfigured()
    const targetApp = request?.app ?? currentConfig?.app

    if (!isGoogleAuthApp(targetApp)) {
      error.value = 'Google sign-in is only available for buyer and seller apps'
      throw new Error('Google sign-in is only available for buyer and seller apps')
    }

    const defaultReturnUrl =
      typeof window === 'undefined'
        ? '/'
        : normalizeFrontendRedirect(`${window.location.pathname}${window.location.search}`, '/')

    service.startGoogleAuth({
      app: targetApp,
      returnUrl: normalizeFrontendRedirect(request?.returnUrl, defaultReturnUrl),
      culture: request?.culture ?? currentCulture(i18nLocale),
    })
  }

  const confirmGoogleLink = async (
    request: ConfirmGoogleLinkRequest,
  ): Promise<SessionResponse> => {
    const service = assertConfigured()

    try {
      isLoading.value = true
      error.value = null
      const session = await service.confirmGoogleLink({
        ...request,
        returnUrl: normalizeFrontendRedirect(request.returnUrl, '/'),
        culture: request.culture ?? currentCulture(i18nLocale),
      })
      applySession(session)
      return session
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Google account linking failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const cancelGoogleLink = async (linkToken: string): Promise<void> => {
    const service = assertConfigured()

    try {
      isLoading.value = true
      error.value = null
      await service.cancelGoogleLink(linkToken)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Google account linking cancellation failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (options?: LogoutOptions): Promise<void> => {
    const service = assertConfigured()

    try {
      isLoading.value = true
      error.value = null
      await service.logout(options?.csrfToken)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Logout failed'
    } finally {
      clearSessionState()
      isLoading.value = false
    }
  }

  const getUser = async (): Promise<AppUser | null> => getCurrentUser()

  const ensureAuthenticated = async (): Promise<boolean> => (await getCurrentUser()) !== null

  const storeUpdatedUser = async (appUser: AppUser): Promise<void> => {
    currentUser.value = appUser
  }

  return {
    currentUser,
    csrfToken,
    expiresAt,
    refreshExpiresAt,
    isLoading,
    error,
    isAuthenticated,
    isConfigured,
    ensureAuthenticated,
    login,
    startGoogleAuth,
    confirmGoogleLink,
    cancelGoogleLink,
    logout,
    register,
    refreshSession,
    getCurrentUser,
    getUser,
    storeUpdatedUser,
  }
}

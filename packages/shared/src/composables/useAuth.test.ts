import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { AccountSessionService } from '../features/auth'
import type { SessionResponse } from '../types'
import { initializeAuth, resetAuth, useAuth, isAuthInitialized } from './useAuth'
import { createFakeAuthUser } from '../test-utils/auth'

jest.mock('../features/auth', () => ({
  createAccountSessionService: jest.fn(() => ({
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    refreshSession: jest.fn(),
    startGoogleAuth: jest.fn(),
    confirmGoogleLink: jest.fn(),
    cancelGoogleLink: jest.fn(),
  })),
}))

jest.mock('../utils/cookie', () => ({
  getCookie: jest.fn(() => null),
  deleteCookie: jest.fn(),
}))

jest.mock('../utils/auth-navigation', () => ({
  normalizeFrontendRedirect: jest.fn((url: string, fallback: string) => url ?? fallback),
}))

const makeSession = (): SessionResponse => ({
  csrfToken: 'csrf-test',
  expiresAt: '2026-12-01T00:00:00Z',
  refreshExpiresAt: '2026-12-07T00:00:00Z',
  user: {
    userId: 'user-001',
    email: 'test@example.com',
    roles: ['User'],
    emailVerified: true,
    accountStatus: 'Active',
  },
})

const makeMockService = (): jest.Mocked<AccountSessionService> => ({
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  refreshSession: jest.fn(),
  startGoogleAuth: jest.fn(),
  confirmGoogleLink: jest.fn(),
  cancelGoogleLink: jest.fn(),
})

describe('useAuth', () => {
  beforeEach(() => {
    resetAuth()
  })

  it('should return false for isAuthInitialized before initialization', () => {
    expect(isAuthInitialized()).toBe(false)
  })

  it('should return true for isAuthInitialized after initialization', () => {
    initializeAuth({ app: 'buyer', gatewayBaseUrl: 'http://localhost:5000' })
    expect(isAuthInitialized()).toBe(true)
  })

  it('should return false for isAuthenticated in initial state', () => {
    initializeAuth({ app: 'buyer', gatewayBaseUrl: 'http://localhost:5000' })
    const { isAuthenticated } = useAuth()
    expect(isAuthenticated.value).toBe(false)
  })

  it('should return false for isAuthenticated after reset', () => {
    initializeAuth({ app: 'buyer', gatewayBaseUrl: 'http://localhost:5000' })
    const { isAuthenticated } = useAuth()
    expect(isAuthenticated.value).toBe(false)

    resetAuth()
    expect(isAuthInitialized()).toBe(false)
  })

  it('should set current user when logging in with valid credentials', async () => {
    const { createAccountSessionService } = await import('../features/auth')
    const mockService = makeMockService()
    mockService.login.mockResolvedValue(makeSession())
    jest.mocked(createAccountSessionService).mockReturnValue(mockService)

    initializeAuth({ app: 'buyer', gatewayBaseUrl: 'http://localhost:5000' })
    const { login, currentUser } = useAuth()
    await login({ email: 'test@example.com', password: 'password123', app: 'buyer' })

    expect(currentUser.value).not.toBeNull()
    expect(currentUser.value?.profile.email).toBe('test@example.com')
  })

  it('should be null for current user by default', () => {
    initializeAuth({ app: 'buyer', gatewayBaseUrl: 'http://localhost:5000' })
    const { currentUser } = useAuth()
    expect(currentUser.value).toBeNull()
  })

  it('should return true for isConfigured when initialized', () => {
    initializeAuth({ app: 'buyer', gatewayBaseUrl: 'http://localhost:5000' })
    const { isConfigured } = useAuth()
    expect(isConfigured.value).toBe(true)
  })

  it('should call service and clear user on logout', async () => {
    const { createAccountSessionService } = await import('../features/auth')
    const mockService = makeMockService()
    mockService.login.mockResolvedValue(makeSession())
    mockService.logout.mockResolvedValue(undefined)
    jest.mocked(createAccountSessionService).mockReturnValue(mockService)

    initializeAuth({ app: 'buyer', gatewayBaseUrl: 'http://localhost:5000' })
    const { login, logout, currentUser, isAuthenticated } = useAuth()
    await login({ email: 'test@example.com', password: 'pw', app: 'buyer' })
    expect(isAuthenticated.value).toBe(true)

    await logout()

    expect(mockService.logout).toHaveBeenCalled()
    expect(currentUser.value).toBeNull()
    expect(isAuthenticated.value).toBe(false)
  })

  it('should call service and set user when refreshing session', async () => {
    const { createAccountSessionService } = await import('../features/auth')
    const mockService = makeMockService()
    mockService.refreshSession.mockResolvedValue(makeSession())
    jest.mocked(createAccountSessionService).mockReturnValue(mockService)

    initializeAuth({ app: 'buyer', gatewayBaseUrl: 'http://localhost:5000' })
    const { refreshSession, currentUser } = useAuth()

    const result = await refreshSession()

    expect(mockService.refreshSession).toHaveBeenCalledWith({ app: 'buyer' })
    expect(result).not.toBeNull()
    expect(currentUser.value?.profile.email).toBe('test@example.com')
  })

  it('should clear user when session refresh fails', async () => {
    const { createAccountSessionService } = await import('../features/auth')
    const mockService = makeMockService()
    mockService.refreshSession.mockRejectedValue(new Error('Session expired'))
    jest.mocked(createAccountSessionService).mockReturnValue(mockService)

    initializeAuth({ app: 'buyer', gatewayBaseUrl: 'http://localhost:5000' })
    const { refreshSession, currentUser, error } = useAuth()

    const result = await refreshSession()

    expect(result).toBeNull()
    expect(currentUser.value).toBeNull()
    expect(error.value).toBe('Session expired')
  })

  it('should call service and return response on register', async () => {
    const { createAccountSessionService } = await import('../features/auth')
    const registerResponse = { maskedEmail: '***@example.com', app: 'buyer' as const }
    const mockService = makeMockService()
    mockService.register.mockResolvedValue(registerResponse)
    jest.mocked(createAccountSessionService).mockReturnValue(mockService)

    initializeAuth({ app: 'buyer', gatewayBaseUrl: 'http://localhost:5000' })
    const { register } = useAuth()

    const result = await register({
      email: 'new@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
      fullName: 'New User',
      app: 'buyer',
    })

    expect(mockService.register).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'new@example.com' }),
    )
    expect(result).toEqual(registerResponse)
  })

  it('should return cached user from getCurrentUser', async () => {
    const { createAccountSessionService } = await import('../features/auth')
    const mockService = makeMockService()
    mockService.login.mockResolvedValue(makeSession())
    jest.mocked(createAccountSessionService).mockReturnValue(mockService)

    initializeAuth({ app: 'buyer', gatewayBaseUrl: 'http://localhost:5000' })
    const { login, getCurrentUser } = useAuth()
    await login({ email: 'test@example.com', password: 'pw', app: 'buyer' })

    const user = await getCurrentUser()

    expect(user).not.toBeNull()
    expect(user?.profile.email).toBe('test@example.com')
    expect(mockService.refreshSession).not.toHaveBeenCalled()
  })

  it('should update current user when storing updated user', async () => {
    const { createAccountSessionService } = await import('../features/auth')
    const mockService = makeMockService()
    jest.mocked(createAccountSessionService).mockReturnValue(mockService)

    initializeAuth({ app: 'buyer', gatewayBaseUrl: 'http://localhost:5000' })
    const { storeUpdatedUser, currentUser } = useAuth()
    const fakeUser = createFakeAuthUser({ id: 'custom-user' })

    await storeUpdatedUser(fakeUser)

    expect(currentUser.value?.id).toBe('custom-user')
  })
})

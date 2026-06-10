import type { CultureText } from '../features/user-settings/user-settings.types'

export type AuthApp = 'admin' | 'seller' | 'buyer'
export type GoogleAuthApp = Exclude<AuthApp, 'admin'>

export type GoogleAuthErrorCode =
  | 'GoogleCancelled'
  | 'GoogleFailed'
  | 'GoogleEmailMissing'
  | 'GoogleEmailUnverified'
  | 'GoogleLinkDeclined'
  | 'GoogleLinkExpired'
  | 'GoogleLinkFailed'
  | 'InvalidCredentials'
  | 'AccountLocked'
  | 'AccountInactive'
  | 'AccountNotAllowed'
  | 'validationFailed'

export interface SignInRequest {
  email: string
  password: string
  app: AuthApp
  returnUrl?: string
  culture?: CultureText | string
}

export interface RegisterAccountRequest {
  email: string
  password: string
  confirmPassword: string
  fullName?: string
  app: Exclude<AuthApp, 'admin'>
  returnUrl?: string
  culture?: CultureText | string
}

export interface RegisterAccountResponse {
  maskedEmail: string
  app: GoogleAuthApp
  canResendAt?: string
}

export interface RefreshSessionRequest {
  app: AuthApp
}

export interface StartGoogleAuthRequest {
  app: GoogleAuthApp
  returnUrl?: string
  culture?: CultureText | string
}

export interface ConfirmGoogleLinkRequest {
  consentAccepted: true
  password: string
  linkToken: string
  app: GoogleAuthApp
  returnUrl?: string
  culture?: CultureText | string
}

export interface SessionUser {
  userId: string
  email: string
  displayName?: string
  roles: string[]
  emailVerified: boolean
  accountStatus: string
  avatarUrl?: string
}

export interface SessionResponse {
  user: SessionUser
  expiresAt: string
  refreshExpiresAt?: string
  csrfToken: string
  redirectTo?: string
}

export interface ErrorCodeDto {
  code: string
  messageCode: string
  source?: string
}

export interface ExceptionModel {
  errors: ErrorCodeDto[]
  status: string
  timestamp: string
  traceId: string
  version: string
}

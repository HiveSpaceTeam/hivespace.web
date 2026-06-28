import type { CultureText } from '../user-settings/user-settings.types'
import type { AuthApp } from '../../types'

export interface RequestOtpSignInRequest {
  email: string
  app: Exclude<AuthApp, 'admin'>
  returnUrl?: string
  culture?: CultureText | string
}

export interface RequestOtpSignInResponse {
  challengeToken: string
  expiresAt: string
  canResendAt: string
}

export interface VerifyOtpSignInRequest {
  challengeToken: string
  code: string
  app: Exclude<AuthApp, 'admin'>
  returnUrl?: string
  culture?: CultureText | string
}

export interface VerifyOtpSignInResponse {
  redirectUrl?: string
  expiresAt: string
  refreshExpiresAt?: string
}

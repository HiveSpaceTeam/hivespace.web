import { apiService } from './api'
import { buildApiUrl } from '@/config'
import type { ConfirmEmailVerificationRequest, SendEmailVerificationRequest } from '@/types'

// Account API endpoints
const ACCOUNT_ENDPOINTS = {
  SEND_EMAIL_VERIFICATION: 'accounts/email-verification',
  VERIFY_EMAIL: 'accounts/email-verification/verify',
} as const

// Account service class
class AccountService {
  /**
   * Send email verification link - returns HTTP 202 Accepted if successful
   */
  async sendVerificationEmail(callbackUrl: string, returnUrl?: string | null): Promise<void> {
    const url = buildApiUrl(ACCOUNT_ENDPOINTS.SEND_EMAIL_VERIFICATION)
    const requestData: SendEmailVerificationRequest = {
      callbackUrl,
      returnUrl,
    }

    // This endpoint returns HTTP 202 Accepted with no response body on success
    await apiService.post<void>(url, requestData)
  }

  /**
   * Confirm email verification with token - endpoint is unauthenticated (userId + token prove identity)
   */
  async verifyEmail(userId: string, token: string): Promise<void> {
    const url = buildApiUrl(ACCOUNT_ENDPOINTS.VERIFY_EMAIL)

    const requestData: ConfirmEmailVerificationRequest = {
      userId,
      token,
    }

    // This endpoint throws exception if token is invalid/expired
    await apiService.post<void>(url, requestData)
  }
}

// Create and export the account service instance
export const accountService = new AccountService()

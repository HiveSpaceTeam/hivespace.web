// Account-related type definitions

/**
 * Request DTO for sending email verification
 */
export interface SendEmailVerificationRequest {
  callbackUrl: string
  returnUrl?: string | null
}

export interface ConfirmEmailVerificationRequest {
  userId: string
  token: string
  returnUrl?: string | null
}

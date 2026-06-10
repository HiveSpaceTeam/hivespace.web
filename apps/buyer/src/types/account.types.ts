export interface ResendEmailVerificationRequest {
  email: string
  app: 'buyer'
  returnUrl?: string | null
  culture?: string | null
}

export interface VerifyEmailRequest {
  userId: string
  token: string
}

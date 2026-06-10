import type { ResendEmailVerificationRequest, VerifyEmailRequest } from '@/types'
import { BaseService } from './base.service'

class AccountService extends BaseService {
  async resendVerificationEmail(request: ResendEmailVerificationRequest): Promise<void> {
    return this.post<void>('accounts/email-verification/resend', request)
  }

  async verifyEmail(request: VerifyEmailRequest): Promise<void> {
    return this.post<void>('accounts/email-verification/verify', request)
  }
}

export const accountService = new AccountService()

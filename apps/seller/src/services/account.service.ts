import type { ConfirmEmailVerificationRequest, SendEmailVerificationRequest } from '@/types'
import { BaseService } from './base.service'

class AccountService extends BaseService {
  async sendVerificationEmail(callbackUrl: string, returnUrl?: string | null): Promise<void> {
    const requestData: SendEmailVerificationRequest = { callbackUrl, returnUrl }
    return this.post<void>('accounts/email-verification', requestData)
  }

  async verifyEmail(userId: string, token: string): Promise<void> {
    const requestData: ConfirmEmailVerificationRequest = { userId, token }
    return this.post<void>('accounts/email-verification/verify', requestData)
  }
}

export const accountService = new AccountService()

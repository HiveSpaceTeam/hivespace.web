import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ResendEmailVerificationRequest } from '@/types'
import { accountService } from '@/services/account.service'

export const useAccountStore = defineStore('account', () => {
  const isSendingVerification = ref(false)
  const isVerifyingEmail = ref(false)

  const resendVerificationEmail = async (
    request: ResendEmailVerificationRequest,
  ): Promise<void> => {
    try {
      isSendingVerification.value = true
      await accountService.resendVerificationEmail(request)
    } finally {
      isSendingVerification.value = false
    }
  }

  const verifyEmail = async (userId: string, token: string): Promise<void> => {
    try {
      isVerifyingEmail.value = true
      await accountService.verifyEmail({ userId, token })
    } finally {
      isVerifyingEmail.value = false
    }
  }

  return {
    isSendingVerification,
    isVerifyingEmail,
    resendVerificationEmail,
    verifyEmail,
  }
})

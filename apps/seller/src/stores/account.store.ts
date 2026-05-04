import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuth } from '@hivespace/shared'
import { accountService } from '@/services/account.service'
import refreshToken from '@/services/refresh.service'

export const useAccountStore = defineStore('account', () => {
  const isSendingVerification = ref(false)
  const isVerifyingEmail = ref(false)

  const sendVerificationEmail = async (callbackUrl: string, returnUrl?: string | null) => {
    try {
      isSendingVerification.value = true
      await accountService.sendVerificationEmail(callbackUrl, returnUrl)
    } finally {
      isSendingVerification.value = false
    }
  }

  const verifyEmail = async (userId: string, token: string) => {
    try {
      isVerifyingEmail.value = true
      await accountService.verifyEmail(userId, token)

      const { getCurrentUser } = useAuth()
      const currentUser = await getCurrentUser()
      if (currentUser) {
        await refreshToken(currentUser, true)
      }
    } finally {
      isVerifyingEmail.value = false
    }
  }

  return {
    isSendingVerification,
    isVerifyingEmail,
    sendVerificationEmail,
    verifyEmail,
  }
})

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  createOtpAuthService,
  type RequestOtpSignInRequest,
  type VerifyOtpSignInRequest,
  type VerifyOtpSignInResponse,
} from '@hivespace/shared'
import { config } from '@/config'

const otpAuthService = createOtpAuthService(config.auth.gatewayBaseUrl)

type RequestOtpPayload = Omit<RequestOtpSignInRequest, 'app'>
type VerifyOtpPayload = Omit<VerifyOtpSignInRequest, 'app' | 'challengeToken'>

export const useOtpAuthStore = defineStore('otp-auth', () => {
  const email = ref('')
  const challengeToken = ref<string | null>(null)
  const expiresAt = ref<string | null>(null)
  const canResendAt = ref<string | null>(null)
  const isRequestingOtp = ref(false)
  const isVerifyingOtp = ref(false)
  const requestError = ref<string | null>(null)
  const verifyError = ref<string | null>(null)

  const hasActiveChallenge = computed(() => Boolean(challengeToken.value))

  const resetOtpState = () => {
    email.value = ''
    challengeToken.value = null
    expiresAt.value = null
    canResendAt.value = null
    requestError.value = null
    verifyError.value = null
  }

  const requestOtp = async (request: RequestOtpPayload): Promise<void> => {
    try {
      isRequestingOtp.value = true
      requestError.value = null
      verifyError.value = null

      const response = await otpAuthService.requestOtp({
        ...request,
        app: config.auth.app,
      })

      email.value = request.email.trim()
      challengeToken.value = response.challengeToken
      expiresAt.value = response.expiresAt
      canResendAt.value = response.canResendAt
    } catch (error) {
      requestError.value = error instanceof Error ? error.message : 'validationFailed'
      throw error
    } finally {
      isRequestingOtp.value = false
    }
  }

  const verifyOtp = async (request: VerifyOtpPayload): Promise<VerifyOtpSignInResponse> => {
    if (!challengeToken.value) {
      throw new Error('missingChallengeToken')
    }

    try {
      isVerifyingOtp.value = true
      verifyError.value = null

      const response = await otpAuthService.verifyOtp({
        ...request,
        app: config.auth.app,
        challengeToken: challengeToken.value,
      })

      return response
    } catch (error) {
      verifyError.value = error instanceof Error ? error.message : 'validationFailed'
      throw error
    } finally {
      isVerifyingOtp.value = false
    }
  }

  return {
    email,
    challengeToken,
    expiresAt,
    canResendAt,
    isRequestingOtp,
    isVerifyingOtp,
    requestError,
    verifyError,
    hasActiveChallenge,
    requestOtp,
    verifyOtp,
    resetOtpState,
  }
})

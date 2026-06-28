<template>
  <AuthLayout
    :title="t('auth.otpCode.title')"
    :subtitle="
      t('auth.otpCode.subtitle', {
        email: otpAuthStore.email || t('auth.otpCode.emailFallback'),
      })
    "
    :image-src="authImage"
    :image-alt="t('auth.image.alt')"
    :image-heading="t('auth.image.heading')"
    :image-body="t('auth.image.body')"
    image-presentation="plain-wide"
  >
    <div
      v-if="formErrors.common.length"
      class="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
      role="alert"
    >
      <p v-for="message in formErrors.common" :key="message">{{ message }}</p>
    </div>

    <div
      v-if="isExpired"
      class="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
      role="status"
    >
      <p class="font-medium">{{ t('auth.otpCode.expiredTitle') }}</p>
      <p class="mt-1">{{ t('auth.otpCode.expiredBody') }}</p>
    </div>

    <form class="space-y-5" @submit.prevent="handleSubmit">
      <fieldset>
        <legend class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-200">
          {{ t('auth.otpCode.label') }}
        </legend>
        <div class="flex gap-2">
          <input
            v-for="(_digit, index) in digits"
            :key="index"
            :ref="(element) => setInputRef(element, index)"
            :value="digits[index]"
            :aria-label="t('auth.otpCode.digitLabel', { index: index + 1 })"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="1"
            class="h-12 w-12 rounded-lg border border-gray-300 text-center text-lg font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            @input="handleDigitInput(index, $event)"
            @keydown="handleDigitKeydown(index, $event)"
            @paste="handlePaste"
          />
        </div>
        <p v-if="formErrors.code" class="mt-2 text-sm text-red-600">
          {{ formErrors.code }}
        </p>
      </fieldset>

      <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <p>
          {{ t('auth.otpCode.expiresIn') }}
          <span class="font-medium text-gray-900 dark:text-white">{{ expiryDisplayValue }}</span>
        </p>
        <p>
          <button
            type="button"
            class="font-medium text-brand-500 disabled:text-gray-400"
            :disabled="isResendDisabled || otpAuthStore.isRequestingOtp"
            @click="handleResend"
          >
            {{ t('auth.otpCode.resendAction') }}
          </button>
          <span v-if="isResendDisabled" class="ml-2">
            {{ t('auth.otpCode.resendIn', { time: resendDisplayValue }) }}
          </span>
        </p>
      </div>

      <Button
        type="submit"
        class="w-full"
        :loading="otpAuthStore.isVerifyingOtp"
        :disabled="isExpired"
      >
        {{ t('auth.otpCode.submit') }}
      </Button>
    </form>

    <p class="mt-5 text-sm text-gray-600 dark:text-gray-400">
      {{ t('auth.otpCode.backToPasswordPrompt') }}
      <RouterLink
        class="font-medium text-brand-500 hover:text-brand-600"
        :to="{ path: '/signin', query: authLinkQuery }"
        @click="otpAuthStore.resetOtpState()"
      >
        {{ t('auth.actions.backToSignIn') }}
      </RouterLink>
    </p>
  </AuthLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, type ComponentPublicInstance } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  AuthLayout,
  Button,
  normalizeFrontendRedirect,
  useAppStore,
  useOtpTimer,
  type ExceptionModel,
} from '@hivespace/shared'
import { useOtpAuthStore } from '@/stores/otp-auth.store'
import authImage from '@/assets/auth/buyer-auth.svg'

const CODE_LENGTH = 6

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const appStore = useAppStore()
const otpAuthStore = useOtpAuthStore()
const { canResendAt, email, expiresAt, hasActiveChallenge } = storeToRefs(otpAuthStore)

const digits = ref<string[]>(Array.from({ length: CODE_LENGTH }, () => ''))
const inputRefs = ref<Array<HTMLInputElement | null>>(
  Array.from({ length: CODE_LENGTH }, () => null),
)
const formErrors = ref<{ common: string[]; code: string }>({ common: [], code: '' })

const authLinkQuery = computed(() => {
  const value = route.query.returnUrl
  return typeof value === 'string' ? { returnUrl: value } : {}
})

const returnUrl = () => normalizeFrontendRedirect(route.query.returnUrl, '/')

const expiryTimer = useOtpTimer(expiresAt)
const resendTimer = useOtpTimer(canResendAt)

const isExpired = computed(() => expiryTimer.isExpired.value)
const expiryDisplayValue = computed(() => expiryTimer.displayValue.value)
const resendDisplayValue = computed(() => resendTimer.displayValue.value)
const isResendDisabled = computed(
  () => !email.value || resendTimer.remainingSeconds.value > 0,
)

const redirectToRequest = async () => {
  await router.replace({ path: '/auth/otp', query: authLinkQuery.value })
}

onMounted(async () => {
  if (!hasActiveChallenge.value) {
    await redirectToRequest()
  }
})

watch(isExpired, (expired) => {
  if (expired) {
    formErrors.value.common = [t('auth.otpCode.expiredBody')]
  }
})

const setInputRef = (
  element: Element | ComponentPublicInstance | null,
  index: number,
) => {
  inputRefs.value[index] = element instanceof HTMLInputElement ? element : null
}

const focusInput = (index: number) => {
  inputRefs.value[index]?.focus()
  inputRefs.value[index]?.select()
}

const clearErrors = () => {
  formErrors.value = { common: [], code: '' }
}

const mapError = (error: unknown): string => {
  const model = error as Partial<ExceptionModel>
  const first = model.errors?.[0]
  const key = first?.messageCode || first?.code || 'validationFailed'
  const translated = t(`auth.errors.${key}`)

  return translated === `auth.errors.${key}`
    ? t('auth.errors.validationFailed')
    : translated
}

const codeValue = computed(() => digits.value.join(''))

const validateCode = (): boolean => {
  clearErrors()

  if (isExpired.value) {
    formErrors.value.common = [t('auth.otpCode.expiredBody')]
    return false
  }

  if (codeValue.value.length !== CODE_LENGTH) {
    formErrors.value.code = t('auth.otpCode.codeRequired')
    return false
  }

  return true
}

const handleDigitInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '').slice(-1)
  digits.value[index] = value
  target.value = value

  if (value && index < CODE_LENGTH - 1) {
    focusInput(index + 1)
  }
}

const handleDigitKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key !== 'Backspace') return

  if (digits.value[index]) {
    digits.value[index] = ''
    return
  }

  if (index > 0) {
    focusInput(index - 1)
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()

  const pasted = event.clipboardData
    ?.getData('text')
    .replace(/\D/g, '')
    .slice(0, CODE_LENGTH)
  if (!pasted) return

  digits.value = Array.from(
    { length: CODE_LENGTH },
    (_, index) => pasted[index] ?? '',
  )

  const lastIndex = Math.min(pasted.length, CODE_LENGTH) - 1
  if (lastIndex >= 0) {
    focusInput(lastIndex)
  }
}

const handleSubmit = async () => {
  if (!validateCode()) return

  try {
    const response = await otpAuthStore.verifyOtp({
      code: codeValue.value,
      returnUrl: returnUrl(),
      culture: String(locale.value),
    })

    const destination = normalizeFrontendRedirect(response.redirectUrl, returnUrl())
    await router.push(destination)
    otpAuthStore.resetOtpState()
  } catch (error) {
    const message = mapError(error)
    formErrors.value.common = [message]
    appStore.notifyError(t('auth.errors.signInFailed'), message)
  }
}

const handleResend = async () => {
  if (isResendDisabled.value) return

  try {
    clearErrors()
    await otpAuthStore.requestOtp({
      email: email.value,
      returnUrl: returnUrl(),
      culture: String(locale.value),
    })
    digits.value = Array.from({ length: CODE_LENGTH }, () => '')
    focusInput(0)
    appStore.notifySuccess(
      t('auth.otpRequest.successTitle'),
      t('auth.otpRequest.successBody'),
    )
  } catch (error) {
    const message = mapError(error)
    formErrors.value.common = [message]
    appStore.notifyError(t('auth.errors.signInFailed'), message)
  }
}
</script>

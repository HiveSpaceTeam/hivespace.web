<template>
  <AuthLayout
    :title="t('auth.otpRequest.title')"
    :subtitle="t('auth.otpRequest.subtitle')"
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
      v-if="requestSucceeded"
      class="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300"
      role="status"
    >
      <p class="font-medium">{{ t('auth.otpRequest.successTitle') }}</p>
      <p class="mt-1">{{ t('auth.otpRequest.successBody') }}</p>
    </div>

    <form class="space-y-5" @submit.prevent="handleSubmit">
      <Input
        id="email"
        v-model="form.email"
        type="email"
        :label="t('auth.otpRequest.email')"
        :placeholder="t('auth.otpRequest.emailPlaceholder')"
        :error="formErrors.email"
        required
      />

      <Button type="submit" class="w-full" :loading="isRequestingOtp">
        {{ t('auth.otpRequest.submit') }}
      </Button>
    </form>

    <p class="mt-5 text-sm text-gray-600 dark:text-gray-400">
      {{ t('auth.otpRequest.backToPasswordPrompt') }}
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
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  AuthLayout,
  Button,
  Input,
  useAppStore,
  normalizeFrontendRedirect,
  validateEmail,
  validateRequired,
  type ExceptionModel,
} from '@hivespace/shared'
import { storeToRefs } from 'pinia'
import { useOtpAuthStore } from '@/stores'
import authImage from '@/assets/auth/seller-auth.svg'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const appStore = useAppStore()
const otpAuthStore = useOtpAuthStore()
const { isRequestingOtp } = storeToRefs(otpAuthStore)

const form = reactive({
  email: '',
})
const formErrors = reactive({
  common: [] as string[],
  email: '',
})
const requestSucceeded = ref(false)

const authLinkQuery = computed(() => {
  const value = route.query.returnUrl
  return typeof value === 'string' ? { returnUrl: value } : {}
})

const returnUrl = () => normalizeFrontendRedirect(route.query.returnUrl, '/product/list')

const clearErrors = () => {
  formErrors.common = []
  formErrors.email = ''
}

const validateForm = (): boolean => {
  clearErrors()

  formErrors.email =
    validateRequired(form.email, t('auth.errors.emailRequired')) ||
    validateEmail(form.email, t('auth.errors.emailInvalid')) ||
    ''

  return !formErrors.email
}

const mapError = (error: unknown): string => {
  const model = error as Partial<ExceptionModel>
  const first = model.errors?.[0]
  const key = first?.messageCode || first?.code || 'validationFailed'
  const translated = t(`auth.errors.${key}`)

  return translated === `auth.errors.${key}` ? t('auth.errors.validationFailed') : translated
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    await otpAuthStore.requestOtp({
      email: form.email.trim(),
      returnUrl: returnUrl(),
      culture: String(locale.value),
    })
    requestSucceeded.value = true
    appStore.notifySuccess(
      t('auth.otpRequest.successTitle'),
      t('auth.otpRequest.successBody'),
    )
    await router.push({
      path: '/auth/otp/code',
      query: authLinkQuery.value,
    })
  } catch (error) {
    const message = mapError(error)
    formErrors.common = [message]
    appStore.notifyError(t('auth.errors.signInFailed'), message)
  }
}
</script>

<template>
  <AuthLayout
    :title="t('verifyEmail.title')"
    :subtitle="t('verifyEmail.subtitle')"
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
      v-if="guidanceMessage"
      class="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
    >
      <p>{{ guidanceMessage }}</p>
    </div>

    <div
      v-else-if="sentBefore"
      class="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300"
    >
      <p class="font-medium">{{ t('verifyEmail.messages.success') }}</p>
      <p class="mt-1">{{ t('verifyEmail.messages.verificationSent') }}</p>
    </div>

    <form class="space-y-5" @submit.prevent="handleSubmit">
      <Input
        id="email"
        v-model="form.email"
        type="email"
        :label="t('verifyEmail.fields.emailAddress')"
        :placeholder="t('verifyEmail.placeholders.emailAddress')"
        :error="formErrors.email"
        required
      />

      <Button type="submit" class="w-full" :disabled="isSendingVerification || cooldownActive">
        <template v-if="cooldownActive">
          {{ t('verifyEmail.actions.resendVerification') }} ({{ cooldownSeconds }}s)
        </template>
        <template v-else>
          {{
            sentBefore
              ? t('verifyEmail.actions.resendVerification')
              : t('verifyEmail.actions.sendVerification')
          }}
        </template>
      </Button>
    </form>

    <p v-if="cooldownActive" class="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
      {{ t('verifyEmail.messages.cooldownActive') }}
    </p>

    <div class="mt-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
      <p>{{ t('verifyEmail.help.checkInbox') }}</p>
      <p>{{ t('verifyEmail.help.clickLink') }}</p>
      <p>{{ t('verifyEmail.help.resendInfo', { seconds: cooldownDuration }) }}</p>
    </div>

    <p class="mt-5 text-sm text-gray-600 dark:text-gray-400">
      {{ t('verifyEmail.help.backToSignInPrompt') }}
      <RouterLink
        class="font-medium text-brand-500 hover:text-brand-600"
        :to="{ path: '/signin', query: signInQuery }"
      >
        {{ t('auth.actions.backToSignIn') }}
      </RouterLink>
    </p>
  </AuthLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  AuthLayout,
  Button,
  Input,
  useAppStore,
  useCooldown,
  getPendingVerificationEmail,
  setPendingVerificationEmail,
  validateEmail,
  validateRequired,
  type ExceptionModel,
} from '@hivespace/shared'
import { storeToRefs } from 'pinia'
import { useAccountStore } from '@/stores'
import authImage from '@/assets/auth/buyer-auth.svg'

const route = useRoute()
const { t, locale } = useI18n()
const appStore = useAppStore()
const accountStore = useAccountStore()
const { isSendingVerification } = storeToRefs(accountStore)
const signInQuery =
  typeof route.query.returnUrl === 'string' ? { returnUrl: route.query.returnUrl } : undefined
const outcome = typeof route.query.outcome === 'string' ? route.query.outcome : null
const resendReturnUrl =
  typeof route.query.returnUrl === 'string' ? route.query.returnUrl : '/'

const cooldownDuration = 60
const { isActive: cooldownActive, secondsRemaining: cooldownSeconds, start: startCooldown } =
  useCooldown(cooldownDuration)
const maskedEmail =
  typeof route.query.maskedEmail === 'string' ? route.query.maskedEmail.trim() : ''

const form = reactive({
  email: getPendingVerificationEmail('buyer'),
})

const formErrors = reactive({
  common: [] as string[],
  email: '',
})

const sentBefore = ref(Boolean(maskedEmail))
const trimmedEmail = computed(() => form.email.trim())
const guidanceMessage = computed(() => {
  if (outcome === 'pendingVerification') {
    return t('verifyEmail.messages.pendingVerificationRequired')
  }

  if (outcome === 'verificationRecovery') {
    return t('verifyEmail.messages.verificationRecovery')
  }

  if (outcome === 'duplicatePendingAccount') {
    return t('verifyEmail.messages.duplicatePendingAccount')
  }

  return null
})

const clearErrors = () => {
  formErrors.common = []
  formErrors.email = ''
}

const validateForm = (): boolean => {
  clearErrors()

  formErrors.email =
    validateRequired(trimmedEmail.value, t('verifyEmail.errors.emailRequired')) ||
    validateEmail(trimmedEmail.value, t('verifyEmail.errors.emailInvalid')) ||
    ''

  return !formErrors.email
}

const mapError = (error: unknown): string => {
  const model = error as Partial<ExceptionModel>
  const first = model.errors?.[0]
  const key = first?.messageCode || first?.code || 'validationFailed'
  const translated = t(`verifyEmail.errors.${key}`)

  return translated === `verifyEmail.errors.${key}`
    ? t('verifyEmail.errors.validationFailed')
    : translated
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    setPendingVerificationEmail('buyer', trimmedEmail.value)
    await accountStore.resendVerificationEmail({
      email: trimmedEmail.value,
      app: 'buyer',
      returnUrl: resendReturnUrl,
      culture: String(locale.value),
    })
    sentBefore.value = true
    startCooldown()
    appStore.notifySuccess(
      t('verifyEmail.messages.success'),
      t('verifyEmail.messages.verificationSent'),
    )
  } catch (error) {
    const message = mapError(error)
    formErrors.common = [message]
    appStore.notifyError(t('verifyEmail.messages.error'), message)
  }
}
</script>

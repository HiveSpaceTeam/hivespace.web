<template>
  <div class="min-h-screen">
    <AppHeader :show-sidebar-toggle="false" />

    <div
      class="relative z-1 flex min-h-[calc(100vh-80px)] flex-col items-center justify-center overflow-hidden p-6"
    >
      <div>
        <div class="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
          <img src="/images/shape/grid-01.svg" alt="grid" />
        </div>
        <div
          class="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]"
        >
          <img src="/images/shape/grid-01.svg" alt="grid" />
        </div>
      </div>

      <div class="mx-auto w-full max-w-[500px] text-center">
        <div class="mb-8">
          <MailIcon class="mx-auto mb-4 h-16 w-16 text-brand-500" />
          <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {{ t('verifyEmail.title') }}
          </h1>
          <p class="text-base text-gray-700 dark:text-gray-400 sm:text-lg">
            {{ t('verifyEmail.subtitle') }}
          </p>
        </div>

        <div
          v-if="showSuccessBanner"
          class="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        >
          <div
            class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20"
          >
            <CheckLargeIcon class="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('verifyEmail.messages.success') }}
          </h3>
          <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {{ t('verifyEmail.messages.verificationSent') }}
          </p>
          <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>{{ t('verifyEmail.help.checkInbox') }}</p>
            <p>{{ t('verifyEmail.help.clickLink') }}</p>
          </div>
        </div>

        <div
          v-else
          class="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        >
          <div
            v-if="guidanceMessage"
            class="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
          >
            <p>{{ guidanceMessage }}</p>
          </div>

          <form class="space-y-6 text-left" @submit.prevent="handleSubmit">
            <div
              v-if="formErrors.common.length > 0"
              class="rounded-lg bg-red-100 p-4 text-sm text-red-700 dark:bg-red-200 dark:text-red-800"
              role="alert"
            >
              <template v-if="formErrors.common.length === 1">
                <div>{{ formErrors.common[0] }}</div>
              </template>
              <template v-else>
                <ul class="ml-4 mt-2 list-inside list-disc space-y-1">
                  <li v-for="(error, index) in formErrors.common" :key="index">
                    {{ error }}
                  </li>
                </ul>
              </template>
            </div>

            <div>
              <div class="mb-1.5 flex items-center justify-between">
                <label
                  for="email"
                  class="required-label block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  {{ t('verifyEmail.fields.emailAddress') }}
                </label>
                <button
                  v-if="!isEmailEditing"
                  type="button"
                  class="inline-flex items-center text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  :class="[
                    isSendingVerification || cooldownActive
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300',
                  ]"
                  :disabled="isSendingVerification || cooldownActive"
                  @click="enableEmailEditing"
                >
                  <EditIcon class="mr-1 h-4 w-4" />
                  {{ t('verifyEmail.actions.editEmail') }}
                </button>
              </div>
              <div class="flex items-center space-x-2">
                <div class="flex-1">
                  <Input
                    id="email"
                    v-model="formData.email"
                    type="email"
                    :placeholder="t('verifyEmail.placeholders.emailAddress')"
                    :error="formErrors.email"
                    required
                    :disabled="!isEmailEditing || isSendingVerification || cooldownActive"
                  />
                </div>
                <div v-if="isEmailEditing" class="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    class="px-3 py-2"
                    :disabled="isSendingVerification || cooldownActive"
                    @click="confirmEmailEdit"
                  >
                    <CheckIcon class="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    class="px-3 py-2"
                    :disabled="isSendingVerification || cooldownActive"
                    @click="cancelEmailEdit"
                  >
                    <CloseIcon class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div class="flex flex-col space-y-3">
              <Button
                type="submit"
                variant="primary"
                class="h-11 w-full"
                :disabled="isSendingVerification || cooldownActive"
              >
                <template v-if="isSendingVerification">
                  <LoadingSpinnerIcon class="mr-2 h-4 w-4" />
                  {{ t('verifyEmail.actions.sendVerification') }}
                </template>
                <template v-else-if="cooldownActive">
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

              <p v-if="cooldownActive" class="text-center text-xs text-gray-500 dark:text-gray-400">
                {{ t('verifyEmail.messages.cooldownActive') }}
              </p>

              <div v-else class="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                <p class="text-center">
                  {{ t('verifyEmail.help.resendInfo', { seconds: cooldownSecondsTotal }) }}
                </p>
              </div>
            </div>
          </form>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('auth.register.hasAccount') }}
          <RouterLink
            class="font-medium text-brand-500 hover:text-brand-600"
            :to="{ path: '/signin', query: signInQuery }"
          >
            {{ t('auth.actions.backToSignIn') }}
          </RouterLink>
        </p>
      </div>

      <p
        class="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        &copy; {{ currentYear }} - HiveSpace
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  AppHeader,
  Button,
  CheckIcon,
  CheckLargeIcon,
  CloseIcon,
  EditIcon,
  Input,
  LoadingSpinnerIcon,
  MailIcon,
  useAppStore,
  useCooldown,
  getPendingVerificationEmail,
  setPendingVerificationEmail,
  validateEmail as validateEmailRule,
  validateRequired,
  type ExceptionModel,
} from '@hivespace/shared'
import { useAccountStore } from '@/stores'

const route = useRoute()
const { t, locale } = useI18n()
const appStore = useAppStore()
const accountStore = useAccountStore()
const { isSendingVerification } = storeToRefs(accountStore)
const currentYear = new Date().getFullYear()
const cooldownSecondsTotal = 60
const signInQuery =
  typeof route.query.returnUrl === 'string' ? { returnUrl: route.query.returnUrl } : undefined
const outcome = typeof route.query.outcome === 'string' ? route.query.outcome : null
const resendReturnUrl =
  typeof route.query.returnUrl === 'string' ? route.query.returnUrl : '/product/list'
const maskedEmail =
  typeof route.query.maskedEmail === 'string' ? route.query.maskedEmail.trim() : ''

const formData = reactive({
  email: getPendingVerificationEmail('seller'),
})

interface FormErrors {
  common: string[]
  email: string
}

const formErrors = reactive<FormErrors>({
  common: [],
  email: '',
})

const sentBefore = ref(Boolean(maskedEmail))
const isEmailEditing = ref(!maskedEmail)
const originalEmail = ref(formData.email)
const { isActive: cooldownActive, secondsRemaining: cooldownSeconds, start: startCooldown } =
  useCooldown(cooldownSecondsTotal)

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

const showSuccessBanner = computed(
  () => sentBefore.value && !isEmailEditing.value && !guidanceMessage.value,
)

const clearErrors = () => {
  formErrors.common = []
  formErrors.email = ''
}

const validateEmailField = (): boolean => {
  const email = formData.email.trim()
  const requiredError = validateRequired(email, t('verifyEmail.errors.emailRequired'))
  if (requiredError) {
    formErrors.email = requiredError
    return false
  }

  const invalidError = validateEmailRule(email, t('verifyEmail.errors.emailInvalid'))
  if (invalidError) {
    formErrors.email = invalidError
    return false
  }

  formErrors.email = ''
  return true
}

const enableEmailEditing = () => {
  originalEmail.value = formData.email
  isEmailEditing.value = true
  clearErrors()
}

const confirmEmailEdit = () => {
  if (!validateEmailField()) return

  formData.email = formData.email.trim()
  setPendingVerificationEmail('seller', formData.email)
  isEmailEditing.value = false
  clearErrors()

  if (originalEmail.value !== formData.email) {
    sentBefore.value = false
    appStore.notifySuccess(
      t('verifyEmail.messages.emailUpdated'),
      t('verifyEmail.messages.emailUpdatedSuccess'),
    )
  }
}

const cancelEmailEdit = () => {
  formData.email = originalEmail.value
  isEmailEditing.value = false
  clearErrors()
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
  if (!validateEmailField()) {
    appStore.notifyError(t('verifyEmail.messages.error'), t('verifyEmail.messages.validationFailed'))
    return
  }

  try {
    setPendingVerificationEmail('seller', formData.email)
    await accountStore.resendVerificationEmail({
      email: formData.email.trim(),
      app: 'seller',
      returnUrl: resendReturnUrl,
      culture: String(locale.value),
    })
    sentBefore.value = true
    isEmailEditing.value = false
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

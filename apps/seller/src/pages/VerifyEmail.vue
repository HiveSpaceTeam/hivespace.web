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
          v-if="isSuccess"
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
          v-if="!isSuccess"
          class="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        >
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
                  {{ t('verifyEmail.help.resendInfo', { seconds: COOLDOWN_SECONDS }) }}
                </p>
              </div>
            </div>
          </form>
        </div>

        <div class="text-center">
          <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {{ t('verifyEmail.help.contactSupport') }}
          </p>
        </div>
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
import { onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  useAuth,
  useAppStore,
  useFieldValidation,
  AppHeader,
  Button,
  CheckIcon,
  CheckLargeIcon,
  CloseIcon,
  EditIcon,
  Input,
  LoadingSpinnerIcon,
  MailIcon,
  useCooldown,
  validateEmail as validateEmailRule,
  validateRequired,
  type ErrorResponse,
} from '@hivespace/shared'
import { useAccountStore } from '@/stores'

const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()
const accountStore = useAccountStore()
const { handleFieldValidationErrors, clearFieldErrors } = useFieldValidation()
const { isSendingVerification } = storeToRefs(accountStore)
const currentYear = new Date().getFullYear()
const COOLDOWN_SECONDS = 60

const formData = reactive({
  email: '',
})

interface FormErrors {
  common: string[]
  email: string
}

const formErrors = reactive<FormErrors>({
  common: [],
  email: '',
})

const isSuccess = ref(false)
const sentBefore = ref(false)
const isEmailEditing = ref(false)
const originalEmail = ref('')
const {
  isActive: cooldownActive,
  secondsRemaining: cooldownSeconds,
  start: startCooldown,
} = useCooldown(COOLDOWN_SECONDS)

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

const validateForm = (): boolean => {
  clearErrors()
  return validateEmailField()
}

const enableEmailEditing = () => {
  originalEmail.value = formData.email
  isEmailEditing.value = true
  formErrors.email = ''
}

const confirmEmailEdit = () => {
  if (!validateEmailField()) {
    return
  }

  isEmailEditing.value = false
  formErrors.email = ''

  if (originalEmail.value !== formData.email) {
    appStore.notifySuccess(
      t('verifyEmail.messages.emailUpdated'),
      t('verifyEmail.messages.emailUpdatedSuccess'),
    )
  }
}

const cancelEmailEdit = () => {
  formData.email = originalEmail.value
  isEmailEditing.value = false
  formErrors.email = ''
}

const handleSubmit = async () => {
  if (!validateForm()) {
    appStore.notifyError(
      t('verifyEmail.messages.error'),
      t('verifyEmail.messages.validationFailed'),
    )
    return
  }

  try {
    clearFieldErrors(formErrors)

    const baseUrl = window.location.origin
    const callbackUrl = `${baseUrl}/verify-email-callback`
    const returnUrl = '/register-seller'

    await accountStore.sendVerificationEmail(callbackUrl, returnUrl)

    isSuccess.value = true
    sentBefore.value = true
    startCooldown()

    appStore.notifySuccess(
      t('verifyEmail.messages.success'),
      t('verifyEmail.messages.verificationSent'),
    )
  } catch (error) {
    console.error('Failed to send verification email:', error)

    const errorData = error as ErrorResponse
    const hasFieldErrors = handleFieldValidationErrors(errorData, formErrors)

    if (!hasFieldErrors) {
      const errorMessage = error instanceof Error ? error.message : t('errors.UNKNOWN_ERROR')
      appStore.notifyError(t('verifyEmail.messages.error'), errorMessage as string)
    }
  }
}

onMounted(async () => {
  try {
    const { getCurrentUser } = useAuth()
    const currentUser = await getCurrentUser()
    if (currentUser) {
      if (currentUser.profile?.email_verified) {
        await router.push('/register-seller')
        return
      }

      if (currentUser.profile?.email) {
        formData.email = currentUser.profile.email
      }
    }
  } catch (error) {
    console.warn('Could not load current user email:', error)
  }
})
</script>

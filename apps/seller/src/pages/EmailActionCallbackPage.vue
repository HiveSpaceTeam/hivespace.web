<template>
  <div class="min-h-screen">
    <AppHeader :show-sidebar-toggle="false" />

    <div
      class="relative z-1 flex min-h-[calc(100vh-80px)] flex-col items-center justify-center overflow-hidden p-6"
    >
      <div>
        <div class="absolute right-0 top-0 -z-1 w-full max-w-62.5 xl:max-w-112.5">
          <img src="/images/shape/grid-01.svg" alt="grid" />
        </div>
        <div class="absolute bottom-0 left-0 -z-1 w-full max-w-62.5 rotate-180 xl:max-w-112.5">
          <img src="/images/shape/grid-01.svg" alt="grid" />
        </div>
      </div>

      <div class="mx-auto w-full max-w-125 text-center">
        <div v-if="isLoading" class="mb-8">
          <LoadingSpinnerIcon class="mx-auto mb-4 h-16 w-16 animate-spin text-brand-500" />
          <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {{ t('verifyEmailCallback.loading.title') }}
          </h1>
          <p class="text-base text-gray-700 dark:text-gray-400 sm:text-lg">
            {{ t('verifyEmailCallback.loading.subtitle') }}
          </p>
        </div>

        <div v-else-if="isSuccess" class="mb-8">
          <div
            class="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20"
            >
              <CheckLargeIcon class="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              {{ t('verifyEmailCallback.success.title') }}
            </h1>
            <p class="mb-6 text-base text-gray-700 dark:text-gray-400">
              {{ t('verifyEmailCallback.success.subtitle') }}
            </p>

            <Button class="inline-flex items-center" variant="primary" @click="goToSignIn">
              {{ t('verifyEmailCallback.actions.goToLogin') }}
            </Button>
          </div>
        </div>

        <div v-else-if="isError" class="mb-8">
          <div
            class="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20"
            >
              <ErrorIcon class="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              {{ t('verifyEmailCallback.error.title') }}
            </h1>
            <p class="mb-6 text-base text-gray-700 dark:text-gray-400">
              {{ errorMessage || t('verifyEmailCallback.error.subtitle') }}
            </p>

            <div class="flex flex-col justify-center gap-3 sm:flex-row">
              <Button class="inline-flex items-center" variant="primary" @click="goToVerifyEmail">
                <MailIcon class="mr-2 h-4 w-4" />
                {{ t('verifyEmailCallback.error.sendNewEmail') }}
              </Button>
              <Button class="inline-flex items-center" variant="outline" @click="goToSignIn">
                {{ t('verifyEmailCallback.actions.goToLogin') }}
              </Button>
            </div>
          </div>
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
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { clearPendingVerificationEmail, useAppStore, type ExceptionModel } from '@hivespace/shared'
import {
  AppHeader,
  Button,
  CheckLargeIcon,
  ErrorIcon,
  LoadingSpinnerIcon,
  MailIcon,
} from '@hivespace/shared'
import { useAccountStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()
const accountStore = useAccountStore()
const currentYear = new Date().getFullYear()

const isLoading = ref(true)
const isSuccess = ref(false)
const isError = ref(false)
const errorMessage = ref('')

const mapError = (error: unknown): string => {
  const model = error as Partial<ExceptionModel>
  const first = model.errors?.[0]
  const key = first?.messageCode || first?.code || 'generalError'
  const translated = t(`verifyEmailCallback.errors.${key}`)

  return translated === `verifyEmailCallback.errors.${key}`
    ? t('verifyEmailCallback.errors.generalError')
    : translated
}

const goToSignIn = async () => {
  const returnUrl = typeof route.query.returnUrl === 'string' ? route.query.returnUrl : undefined
  await router.push({
    path: '/signin',
    query: returnUrl ? { returnUrl } : undefined,
  })
}

const goToVerifyEmail = async () => {
  const returnUrl = typeof route.query.returnUrl === 'string' ? route.query.returnUrl : undefined
  await router.push({
    path: '/verify-email',
    query: {
      ...(returnUrl ? { returnUrl } : {}),
      outcome: 'verificationRecovery',
    },
  })
}

onMounted(async () => {
  const userId = typeof route.query.userId === 'string' ? route.query.userId : ''
  const token = typeof route.query.token === 'string' ? route.query.token : ''

  if (!userId || !token) {
    isLoading.value = false
    isError.value = true
    errorMessage.value = t('verifyEmailCallback.error.noToken')
    return
  }

  try {
    await accountStore.verifyEmail(userId, token)
    clearPendingVerificationEmail('seller')
    isLoading.value = false
    isSuccess.value = true
    appStore.notifySuccess(
      t('verifyEmailCallback.success.title'),
      t('verifyEmailCallback.success.subtitle'),
    )
  } catch (error) {
    isLoading.value = false
    isError.value = true
    errorMessage.value = mapError(error)
    appStore.notifyError(t('verifyEmailCallback.error.title'), errorMessage.value)
  }
})
</script>

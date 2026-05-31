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

            <div v-if="returnUrl" class="mb-6 text-center">
              <p class="mb-3 text-sm text-gray-600 dark:text-gray-400">
                {{ t('verifyEmailCallback.success.redirectMessage', { seconds: redirectCountdown }) }}
              </p>
              <Button class="inline-flex items-center" variant="primary" @click="handleRedirect">
                {{ t('verifyEmailCallback.success.clickToRedirect') }}
              </Button>
            </div>

            <div v-else class="text-center">
              <Button class="inline-flex items-center" variant="primary" @click="goToHome">
                <HomeIcon class="mr-2 h-4 w-4" />
                {{ t('verifyEmailCallback.success.backToHome') }}
              </Button>
            </div>
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
              <Button class="inline-flex items-center" variant="outline" @click="goToHome">
                <HomeIcon class="mr-2 h-4 w-4" />
                {{ t('verifyEmailCallback.error.backToHome') }}
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
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuth, useAppStore } from '@hivespace/shared'
import {
  AppHeader,
  Button,
  CheckLargeIcon,
  ErrorIcon,
  HomeIcon,
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
const returnUrl = ref<string | null>(null)
const redirectCountdown = ref(10)

let redirectTimer: number | null = null

const extractUrlParams = () => {
  const token = route.query.token as string
  const userId = route.query.userId as string
  const urlReturnUrl = route.query.returnUrl as string

  if (urlReturnUrl) {
    returnUrl.value = urlReturnUrl
  }

  return { token, userId }
}

const startRedirectCountdown = () => {
  if (!returnUrl.value) return

  redirectTimer = setInterval(() => {
    redirectCountdown.value--
    if (redirectCountdown.value <= 0) {
      handleRedirect()
    }
  }, 1000)
}

const stopRedirectCountdown = () => {
  if (redirectTimer) {
    clearInterval(redirectTimer)
    redirectTimer = null
  }
}

const handleRedirect = () => {
  stopRedirectCountdown()
  if (!returnUrl.value) return

  try {
    if (returnUrl.value.startsWith('http')) {
      const parsed = new URL(returnUrl.value)
      if (parsed.origin === window.location.origin) {
        window.location.href = parsed.toString()
      } else {
        router.push('/')
      }
    } else {
      const path = returnUrl.value.startsWith('/') ? returnUrl.value : `/${returnUrl.value}`
      router.push(path)
    }
  } catch {
    router.push('/')
  }
}

const goToHome = () => {
  router.push('/product/list')
}

const goToVerifyEmail = () => {
  router.push('/verify-email')
}

const verifyEmailToken = async (userId: string, token: string) => {
  try {
    await accountStore.verifyEmail(userId, token)

    isSuccess.value = true
    isLoading.value = false

    appStore.notifySuccess(
      t('verifyEmailCallback.success.title'),
      t('verifyEmailCallback.success.subtitle'),
    )

    if (returnUrl.value) {
      startRedirectCountdown()
    }
  } catch (error) {
    console.error('Email verification failed:', error)
    isError.value = true
    isLoading.value = false
    errorMessage.value = ''

    appStore.notifyError(
      t('verifyEmailCallback.error.title'),
      t('verifyEmailCallback.error.subtitle'),
    )
  }
}

onMounted(async () => {
  const { token, userId } = extractUrlParams()

  const { getCurrentUser } = useAuth()
  const user = await getCurrentUser()
  if (user?.profile.email_verified) {
    isLoading.value = false
    isSuccess.value = true
    startRedirectCountdown()
    return
  }

  if (!token || !userId) {
    isError.value = true
    isLoading.value = false
    errorMessage.value = t('verifyEmailCallback.error.noToken')
    return
  }

  await verifyEmailToken(userId, token)
})

onUnmounted(() => {
  stopRedirectCountdown()
})
</script>

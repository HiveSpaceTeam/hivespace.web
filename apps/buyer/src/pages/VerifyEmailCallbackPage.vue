<template>
  <AuthLayout
    :title="t('verifyEmailCallback.title')"
    :subtitle="currentSubtitle"
    :image-src="authImage"
    :image-alt="t('auth.image.alt')"
    :image-heading="t('auth.image.heading')"
    :image-body="t('auth.image.body')"
    image-presentation="plain-wide"
  >
    <div v-if="state === 'loading'" class="space-y-3 text-center text-sm text-gray-600 dark:text-gray-400">
      <Spinner size="lg" />
      <p>{{ t('verifyEmailCallback.loading.subtitle') }}</p>
    </div>

    <div
      v-else-if="state === 'success'"
      class="rounded-lg border border-green-200 bg-green-50 p-5 text-center text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300"
    >
      <p class="font-medium">{{ t('verifyEmailCallback.success.title') }}</p>
      <p class="mt-1">{{ t('verifyEmailCallback.success.subtitle') }}</p>
      <Button class="mt-4 w-full" @click="goToSignIn">
        {{ t('verifyEmailCallback.actions.goToSignIn') }}
      </Button>
    </div>

    <div
      v-else
      class="rounded-lg border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
    >
      <p class="font-medium">{{ t('verifyEmailCallback.error.title') }}</p>
      <p class="mt-1">{{ errorMessage }}</p>
      <div class="mt-4 space-y-3">
        <Button class="w-full" @click="goToVerifyEmail">
          {{ t('verifyEmailCallback.actions.requestNewVerification') }}
        </Button>
        <Button variant="outline" class="w-full" @click="goToSignIn">
          {{ t('verifyEmailCallback.actions.goToSignIn') }}
        </Button>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  AuthLayout,
  Button,
  Spinner,
  clearPendingVerificationEmail,
  useAppStore,
  type ExceptionModel,
} from '@hivespace/shared'
import { useAccountStore } from '@/stores'
import authImage from '@/assets/auth/buyer-auth.svg'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()
const accountStore = useAccountStore()

const state = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

const currentSubtitle = computed(() => {
  if (state.value === 'success') return t('verifyEmailCallback.success.subtitle')
  if (state.value === 'error') return t('verifyEmailCallback.error.subtitle')
  return t('verifyEmailCallback.loading.subtitle')
})

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
    state.value = 'error'
    errorMessage.value = t('verifyEmailCallback.errors.missingToken')
    return
  }

  try {
    await accountStore.verifyEmail(userId, token)
    clearPendingVerificationEmail('buyer')
    state.value = 'success'
    appStore.notifySuccess(
      t('verifyEmailCallback.success.title'),
      t('verifyEmailCallback.success.subtitle'),
    )
  } catch (error) {
    state.value = 'error'
    errorMessage.value = mapError(error)
    appStore.notifyError(t('verifyEmailCallback.error.title'), errorMessage.value)
  }
})
</script>

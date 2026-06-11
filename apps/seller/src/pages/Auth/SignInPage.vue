<template>
  <AuthLayout
    :title="t('auth.signIn.title')"
    :subtitle="t('auth.signIn.subtitle')"
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

    <form class="space-y-5" @submit.prevent="handleSubmit">
      <Input
        id="email"
        v-model="form.email"
        type="email"
        :label="t('auth.signIn.email')"
        :placeholder="t('auth.signIn.emailPlaceholder')"
        :error="formErrors.email"
        required
      />

      <Input
        id="password"
        v-model="form.password"
        :type="showPassword ? 'text' : 'password'"
        :label="t('auth.signIn.password')"
        :placeholder="t('auth.signIn.passwordPlaceholder')"
        :error="formErrors.password"
        inputClass="pr-10"
        required
      >
        <template #append>
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
            :aria-label="
              showPassword ? t('auth.actions.hidePassword') : t('auth.actions.showPassword')
            "
            @click="showPassword = !showPassword"
          >
            <ShowPasswordIcon v-if="showPassword" />
            <HidePasswordIcon v-else />
          </button>
        </template>
      </Input>

      <Button type="submit" class="w-full" :loading="isLoading">
        {{ t('auth.signIn.submit') }}
      </Button>
    </form>

    <div class="my-5 flex items-center gap-3 text-xs text-gray-400">
      <span class="h-px flex-1 bg-gray-200 dark:bg-gray-700"></span>
      <span>{{ t('auth.google.or') }}</span>
      <span class="h-px flex-1 bg-gray-200 dark:bg-gray-700"></span>
    </div>

    <GoogleAuthButton
      class-name="w-full"
      :label="t('auth.google.continue')"
      :loading="isLoading"
      :on-click="handleGoogleAuth"
    />

    <p class="mt-5 text-sm text-gray-600 dark:text-gray-400">
      {{ t('auth.signIn.noAccount') }}
      <RouterLink class="font-medium text-brand-500 hover:text-brand-600" :to="{ path: '/signup', query: authLinkQuery }">
        {{ t('auth.actions.createAccount') }}
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
  GoogleAuthButton,
  HidePasswordIcon,
  Input,
  ShowPasswordIcon,
  useAppStore,
  useAuth,
  setPendingVerificationEmail,
  normalizeFrontendRedirect,
  validateEmail,
  validateRequired,
  type ExceptionModel,
} from '@hivespace/shared'
import authImage from '@/assets/auth/seller-auth.svg'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const appStore = useAppStore()
const { login, startGoogleAuth, isLoading } = useAuth()

const showPassword = ref(false)
const form = reactive({
  email: '',
  password: '',
})
const formErrors = reactive({
  common: [] as string[],
  email: '',
  password: '',
})
const authLinkQuery = computed(() => {
  const value = route.query.returnUrl
  return typeof value === 'string' ? { returnUrl: value } : {}
})

const returnUrl = () => {
  return normalizeFrontendRedirect(route.query.returnUrl, '/product/list')
}

const clearErrors = () => {
  formErrors.common = []
  formErrors.email = ''
  formErrors.password = ''
}

const routeOutcomeMessage = (): string | null => {
  const code = typeof route.query.error === 'string' ? route.query.error : route.query.outcome
  if (typeof code !== 'string') return null

  const key = `auth.errors.${code}`
  const translated = t(key)
  return translated === key ? null : translated
}

const validateForm = (): boolean => {
  clearErrors()

  formErrors.email =
    validateRequired(form.email, t('auth.errors.emailRequired')) ||
    validateEmail(form.email, t('auth.errors.emailInvalid')) ||
    ''
  formErrors.password = validateRequired(form.password, t('auth.errors.passwordRequired')) || ''

  return !formErrors.email && !formErrors.password
}

const mapError = (error: unknown): string => {
  const model = error as Partial<ExceptionModel>
  const first = model.errors?.[0]
  const key = first?.messageCode || first?.code || 'validationFailed'
  const translated = t(`auth.errors.${key}`)
  return translated === `auth.errors.${key}` ? t('auth.errors.validationFailed') : translated
}

const isPendingVerificationError = (error: unknown): boolean => {
  const model = error as Partial<ExceptionModel>
  const first = model.errors?.[0]
  const key = first?.messageCode || first?.code

  return key === 'EmailVerificationRequired' || key === 'IDN6018'
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    const session = await login({
      email: form.email.trim(),
      password: form.password,
      app: 'seller',
      returnUrl: returnUrl(),
      culture: String(locale.value),
    })

    await router.push(normalizeFrontendRedirect(session?.redirectTo, returnUrl()))
  } catch (error) {
    if (isPendingVerificationError(error)) {
      setPendingVerificationEmail('seller', form.email.trim())
      await router.push({
        path: '/verify-email',
        query: {
          returnUrl: returnUrl(),
          outcome: 'pendingVerification',
        },
      })
      return
    }

    const message = mapError(error)
    formErrors.common = [message]
    appStore.notifyError(t('auth.errors.signInFailed'), message)
  }
}

const handleGoogleAuth = () => {
  startGoogleAuth({
    app: 'seller',
    returnUrl: returnUrl(),
    culture: String(locale.value),
  })
}

const initialOutcome = routeOutcomeMessage()
if (initialOutcome) {
  formErrors.common = [initialOutcome]
}
</script>

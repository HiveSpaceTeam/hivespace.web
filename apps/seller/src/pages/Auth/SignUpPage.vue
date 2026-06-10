<template>
  <AuthLayout
    :title="t('auth.register.title')"
    :subtitle="t('auth.register.subtitle')"
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
        id="fullName"
        v-model="form.fullName"
        :label="t('auth.register.fullName')"
        :placeholder="t('auth.register.fullNamePlaceholder')"
        :error="formErrors.fullName"
        required
      />
      <Input
        id="email"
        v-model="form.email"
        type="email"
        :label="t('auth.register.email')"
        :placeholder="t('auth.register.emailPlaceholder')"
        :error="formErrors.email"
        required
      />
      <Input
        id="password"
        v-model="form.password"
        :type="showPassword ? 'text' : 'password'"
        :label="t('auth.register.password')"
        :placeholder="t('auth.register.passwordPlaceholder')"
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
      <Input
        id="confirmPassword"
        v-model="form.confirmPassword"
        :type="showConfirmPassword ? 'text' : 'password'"
        :label="t('auth.register.confirmPassword')"
        :placeholder="t('auth.register.confirmPasswordPlaceholder')"
        :error="formErrors.confirmPassword"
        inputClass="pr-10"
        required
      >
        <template #append>
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
            :aria-label="
              showConfirmPassword ? t('auth.actions.hidePassword') : t('auth.actions.showPassword')
            "
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <ShowPasswordIcon v-if="showConfirmPassword" />
            <HidePasswordIcon v-else />
          </button>
        </template>
      </Input>

      <div>
        <Checkbox
          id="accept-terms"
          v-model="form.termsAccepted"
          :label="t('auth.register.acceptTerms')"
        />
        <p
          v-if="formErrors.termsAccepted"
          class="form-error-text mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ formErrors.termsAccepted }}
        </p>
      </div>

      <Button type="submit" class="w-full" :loading="isLoading">
        {{ t('auth.register.submit') }}
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
      {{ t('auth.register.hasAccount') }}
      <RouterLink class="font-medium text-brand-500 hover:text-brand-600" to="/signin">
        {{ t('auth.actions.backToSignIn') }}
      </RouterLink>
    </p>
  </AuthLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  AuthLayout,
  Button,
  Checkbox,
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
const { register, startGoogleAuth, isLoading } = useAuth()

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
})
const formErrors = reactive({
  common: [] as string[],
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: '',
})

const returnUrl = () => {
  return normalizeFrontendRedirect(route.query.returnUrl, '/product/list')
}

const clearErrors = () => {
  formErrors.common = []
  formErrors.fullName = ''
  formErrors.email = ''
  formErrors.password = ''
  formErrors.confirmPassword = ''
  formErrors.termsAccepted = ''
}

const validateForm = (): boolean => {
  clearErrors()

  formErrors.fullName = validateRequired(form.fullName, t('auth.errors.fullNameRequired')) || ''
  formErrors.email =
    validateRequired(form.email, t('auth.errors.emailRequired')) ||
    validateEmail(form.email, t('auth.errors.emailInvalid')) ||
    ''
  formErrors.password = validateRequired(form.password, t('auth.errors.passwordRequired')) || ''
  formErrors.confirmPassword =
    validateRequired(form.confirmPassword, t('auth.errors.confirmPasswordRequired')) || ''

  if (!formErrors.confirmPassword && form.password !== form.confirmPassword) {
    formErrors.confirmPassword = t('auth.errors.passwordMismatch')
  }

  if (!form.termsAccepted) {
    formErrors.termsAccepted = t('auth.errors.termsRequired')
  }

  return Object.entries(formErrors).every(([key, value]) => key === 'common' || !value)
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
    const result = await register({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      app: 'seller',
      returnUrl: returnUrl(),
      culture: String(locale.value),
    })
    setPendingVerificationEmail('seller', form.email.trim())

    await router.push({
      path: '/verify-email',
      query: {
        ...(result?.maskedEmail ? { maskedEmail: result.maskedEmail } : {}),
        returnUrl: returnUrl(),
      },
    })
  } catch (error) {
    const message = mapError(error)
    formErrors.common = [message]
    appStore.notifyError(t('auth.errors.registrationFailed'), message)
  }
}

const handleGoogleAuth = () => {
  startGoogleAuth({
    app: 'seller',
    returnUrl: returnUrl(),
    culture: String(locale.value),
  })
}
</script>

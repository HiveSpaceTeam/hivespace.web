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
  HidePasswordIcon,
  Input,
  ShowPasswordIcon,
  useAppStore,
  useAuth,
  normalizeFrontendRedirect,
  validateEmail,
  validateRequired,
  type ExceptionModel,
} from '@hivespace/shared'
import authImage from '@/assets/auth/buyer-auth.svg'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const appStore = useAppStore()
const { login, isLoading } = useAuth()

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
  return normalizeFrontendRedirect(route.query.returnUrl, '/')
}

const clearErrors = () => {
  formErrors.common = []
  formErrors.email = ''
  formErrors.password = ''
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

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    const session = await login({
      email: form.email.trim(),
      password: form.password,
      app: 'buyer',
      returnUrl: returnUrl(),
      culture: String(locale.value),
    })

    await router.push(normalizeFrontendRedirect(session?.redirectTo, returnUrl()))
  } catch (error) {
    const message = mapError(error)
    formErrors.common = [message]
    appStore.notifyError(t('auth.errors.signInFailed'), message)
  }
}
</script>

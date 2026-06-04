<template>
  <AuthLayout
    :title="t('auth.googleLink.title')"
    :subtitle="t('auth.googleLink.subtitle')"
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
      class="mb-5 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-500/10 dark:text-blue-200"
    >
      {{ t('auth.googleLink.body') }}
    </div>

    <form class="space-y-5" @submit.prevent="handleConfirm">
      <Checkbox id="google-link-consent" v-model="form.consentAccepted">
        {{ t('auth.googleLink.consent') }}
      </Checkbox>
      <p
        v-if="formErrors.consentAccepted"
        class="form-error-text mt-1 text-sm text-red-600 dark:text-red-400"
      >
        {{ formErrors.consentAccepted }}
      </p>

      <Input
        id="password"
        v-model="form.password"
        :type="showPassword ? 'text' : 'password'"
        :label="t('auth.googleLink.password')"
        :placeholder="t('auth.googleLink.passwordPlaceholder')"
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

      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ t('auth.googleLink.sellerOnboarding') }}
      </p>

      <Button
        type="submit"
        class="w-full"
        :disabled="!form.consentAccepted"
        :loading="isLoading"
      >
        {{ t('auth.googleLink.confirm') }}
      </Button>
      <Button
        type="button"
        variant="outline"
        class="w-full"
        :disabled="isLoading"
        :on-click="handleCancel"
      >
        {{ t('auth.googleLink.cancel') }}
      </Button>
    </form>

    <div class="mt-5 space-y-2 text-sm">
      <RouterLink class="block font-medium text-brand-500 hover:text-brand-600" to="/signin">
        {{ t('auth.googleLink.passwordSignIn') }}
      </RouterLink>
      <RouterLink class="block font-medium text-brand-500 hover:text-brand-600" to="/signin">
        {{ t('auth.googleLink.passwordReset') }}
      </RouterLink>
      <button
        type="button"
        class="font-medium text-brand-500 hover:text-brand-600"
        :disabled="isLoading"
        @click="handleGoogleAuth"
      >
        {{ t('auth.googleLink.useAnotherGoogle') }}
      </button>
    </div>
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
  HidePasswordIcon,
  Input,
  ShowPasswordIcon,
  useAppStore,
  useAuth,
  normalizeFrontendRedirect,
  validateRequired,
  type ExceptionModel,
} from '@hivespace/shared'
import authImage from '@/assets/auth/seller-auth.svg'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const appStore = useAppStore()
const { confirmGoogleLink, cancelGoogleLink, startGoogleAuth, isLoading } = useAuth()

const showPassword = ref(false)
const form = reactive({
  consentAccepted: false,
  password: '',
})
const formErrors = reactive({
  common: [] as string[],
  consentAccepted: '',
  password: '',
})

const returnUrl = () => normalizeFrontendRedirect(route.query.returnUrl, '/product/list')
const linkToken = () => (typeof route.query.linkToken === 'string' ? route.query.linkToken : '')

const clearErrors = () => {
  formErrors.common = []
  formErrors.consentAccepted = ''
  formErrors.password = ''
}

const validateForm = (): boolean => {
  clearErrors()

  if (!form.consentAccepted) {
    formErrors.consentAccepted = t('auth.errors.googleConsentRequired')
  }

  formErrors.password = validateRequired(form.password, t('auth.errors.passwordRequired')) || ''

  if (!linkToken()) {
    formErrors.common = [t('auth.errors.GoogleLinkExpired')]
  }

  return !formErrors.common.length && !formErrors.consentAccepted && !formErrors.password
}

const mapError = (error: unknown): string => {
  const model = error as Partial<ExceptionModel>
  const first = model.errors?.[0]
  const key = first?.messageCode || first?.code || 'GoogleLinkFailed'
  const translated = t(`auth.errors.${key}`)
  return translated === `auth.errors.${key}` ? t('auth.errors.GoogleLinkFailed') : translated
}

const handleConfirm = async () => {
  if (!validateForm()) return

  try {
    const session = await confirmGoogleLink({
      consentAccepted: true,
      password: form.password,
      linkToken: linkToken(),
      app: 'seller',
      returnUrl: returnUrl(),
      culture: String(locale.value),
    })

    await router.push(normalizeFrontendRedirect(session.redirectTo, returnUrl()))
  } catch (error) {
    const message = mapError(error)
    formErrors.common = [message]
    appStore.notifyError(t('auth.errors.GoogleLinkFailed'), message)
  }
}

const handleCancel = async () => {
  const token = linkToken()
  if (token) {
    await cancelGoogleLink(token)
  }
  await router.push({
    path: '/signin',
    query: { error: 'GoogleLinkDeclined', returnUrl: returnUrl() },
  })
}

const handleGoogleAuth = () => {
  startGoogleAuth({
    app: 'seller',
    returnUrl: returnUrl(),
    culture: String(locale.value),
  })
}
</script>

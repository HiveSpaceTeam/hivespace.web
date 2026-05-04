<template>
  <div class="min-h-screen">
    <FullscreenLoader :visible="isSubmitting" :message="t('registerStore.messages.registrationInProgress')" />
    <AppHeader :show-sidebar-toggle="false" />

    <div class="relative z-1 flex min-h-[calc(100vh-80px)] flex-col items-center justify-center overflow-hidden p-6">
      <div>
        <div class="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
          <img src="/images/shape/grid-01.svg" alt="grid" />
        </div>
        <div class="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
          <img src="/images/shape/grid-01.svg" alt="grid" />
        </div>
      </div>

      <div class="mx-auto w-full max-w-[900px] text-center">
        <h1 class="mb-2 mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          {{ t('registerStore.title') }}
        </h1>
        <p class="mb-10 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
          {{ t('registerStore.subtitle') }}
        </p>

        <form class="space-y-8 text-left" @submit.prevent="handleSubmit">
          <div v-if="formErrors.common.length > 0"
            class="rounded-lg bg-red-100 p-4 text-sm text-red-700 dark:bg-red-200 dark:text-red-800" role="alert">
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

          <div class="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div class="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('registerStore.storeInformation') }}
              </h2>
            </div>

            <div class="space-y-6 p-6">
              <div class="flex flex-col gap-4 md:flex-row md:items-start">
                <label
                  class="required-label text-sm font-medium text-gray-700 dark:text-gray-400 md:mt-3 md:w-1/4 md:pr-4 md:text-right">
                  {{ t('registerStore.fields.storeName') }}
                </label>
                <div class="md:flex-1">
                  <Input id="storeName" v-model="formData.storeName"
                    :placeholder="t('registerStore.placeholders.storeName')" :error="formErrors.storeName" />
                </div>
              </div>

              <div class="flex flex-col gap-4 md:flex-row md:items-start">
                <label
                  class="text-sm font-medium text-gray-700 dark:text-gray-400 md:mt-3 md:w-1/4 md:pr-4 md:text-right">
                  {{ t('registerStore.fields.storeDescription') }}
                </label>
                <div class="md:flex-1">
                  <TextArea id="storeDescription" v-model="formData.description"
                    :placeholder="t('registerStore.placeholders.storeDescription')" :error="formErrors.description"
                    :rows="3" />
                </div>
              </div>

              <div class="flex flex-col gap-4 md:flex-row md:items-start">
                <label
                  class="required-label text-sm font-medium text-gray-700 dark:text-gray-400 md:mt-3 md:w-1/4 md:pr-4 md:text-right">
                  {{ t('registerStore.fields.storeAddress') }}
                </label>
                <div class="md:flex-1">
                  <Input id="storeAddress" v-model="formData.address"
                    :placeholder="t('registerStore.placeholders.storeAddress')" :error="formErrors.address" />
                </div>
              </div>

              <div class="flex flex-col gap-4 md:flex-row md:items-start">
                <label
                  class="required-label text-sm font-medium text-gray-700 dark:text-gray-400 md:mt-10 md:w-1/4 md:pr-4 md:text-right">
                  {{ t('registerStore.fields.storeLogo') }}
                </label>
                <div class="md:flex-1">
                  <FileInput v-model="formData.storeLogoFile" accept="image/*" :max-size="5 * 1024 * 1024"
                    preview-direction="right" :button-text="t('registerStore.fileInput.chooseLogo')" preview-size="lg"
                    preview-shape="square" :help-text="t('registerStore.fileInput.logoHelpText')"
                    :error="formErrors.storeLogoFileId" @change="handleFileChange" @error="handleFileError" />
                </div>
              </div>

              <div class="flex w-full justify-center">
                <Button type="submit" :disabled="isSubmitting" :loading="isSubmitting" variant="primary"
                  class="h-11 px-6">
                  {{ t('registerStore.actions.submit') }}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <p class="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; 2025 - HiveSpace
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuth, useAppStore } from '@hivespace/shared'
import { useStoreStore, useMediaStore } from '@/stores'
import { useFieldValidation, validateRequired } from '@hivespace/shared'
import type { ErrorResponse } from '@hivespace/shared'
import refreshToken from '@/services/refresh.service'
import {
  AppHeader,
  Button,
  FileInput,
  FullscreenLoader,
  Input,
  TextArea,
} from '@hivespace/shared'

const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()
const storeStore = useStoreStore()
const mediaStore = useMediaStore()
const { handleFieldValidationErrors, clearFieldErrors } = useFieldValidation()

const formData = reactive({
  storeName: '',
  description: '',
  storeLogoFile: null as File | null,
  address: '',
})

interface FormErrors {
  common: string[]
  storeName: string
  description: string
  storeLogoFileId: string
  address: string
}

const formErrors = reactive<FormErrors>({
  common: [],
  storeName: '',
  description: '',
  storeLogoFileId: '',
  address: '',
})

const isSubmitting = ref(false)

const clearErrors = () => {
  formErrors.common = []
  formErrors.storeName = ''
  formErrors.description = ''
  formErrors.storeLogoFileId = ''
  formErrors.address = ''
}

const handleFileChange = (file: File | null) => {
  formData.storeLogoFile = file
  if (file) {
    formErrors.storeLogoFileId = ''
  }
}

const handleFileError = (message: string) => {
  formErrors.storeLogoFileId = message
}

const validateForm = (): boolean => {
  clearErrors()
  let isValid = true

  const storeNameError = validateRequired(
    formData.storeName,
    t('registerStore.errors.storeNameRequired'),
  )
  if (storeNameError) {
    formErrors.storeName = storeNameError
    isValid = false
  }

  if (!formData.storeLogoFile) {
    formErrors.storeLogoFileId = t('registerStore.errors.storeLogoRequired')
    isValid = false
  }

  const addressError = validateRequired(
    formData.address,
    t('registerStore.errors.storeAddressRequired'),
  )
  if (addressError) {
    formErrors.address = addressError
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    appStore.notifyError(
      t('registerStore.messages.error'),
      t('registerStore.messages.validationFailed'),
    )
    return
  }

  isSubmitting.value = true

  try {
    clearFieldErrors(formErrors)

    let logoFileId = ''
    if (formData.storeLogoFile instanceof File) {
      const uploadResponse = await mediaStore.uploadMedia(formData.storeLogoFile, 'store-logo')
      logoFileId = uploadResponse.fileId
    }

    const response = await storeStore.registerStore({
      storeName: formData.storeName,
      description: formData.description || null,
      storeLogoFileId: logoFileId,
      address: formData.address,
    })

    if (logoFileId && response?.storeId) {
      await mediaStore.confirmUpload(logoFileId, response.storeId)
    }

    appStore.notifySuccess(
      t('registerStore.messages.success'),
      t('registerStore.messages.registrationSuccess'),
    )
    // Refresh token after successful registration
    const { getCurrentUser } = useAuth()
    const currentUser = await getCurrentUser()
    await refreshToken(currentUser, true)
    await router.push('/product/list')
  } catch (error) {
    console.error('Failed to register seller:', error)

    const errorData = error as ErrorResponse
    const hasFieldErrors = handleFieldValidationErrors(errorData, formErrors)

    if (!hasFieldErrors) {
      const errorMessage = error instanceof Error ? error.message : t('errors.UNKNOWN_ERROR')
      appStore.notifyError(t('registerStore.messages.error'), errorMessage as string)
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    const { getCurrentUser } = useAuth()
    const currentUser = await getCurrentUser()
    if (currentUser?.isSeller()) {
      await router.push('/product/list')
    }
  } catch (error) {
    console.warn('Could not check user seller status:', error)
  }
})
</script>

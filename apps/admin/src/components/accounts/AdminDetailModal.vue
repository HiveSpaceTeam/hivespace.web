<template>
  <div class="w-full max-w-[700px] overflow-y-auto">
    <form class="space-y-4" @submit.prevent="onCreate">
      <!-- Common/General Error -->
      <div v-if="errors.common.length > 0"
        class="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
        <div class="font-medium">{{ t('common.error') }}</div>
        <template v-if="errors.common.length === 1">
          <div>{{ errors.common[0] }}</div>
        </template>
        <template v-else>
          <ul class="mt-2 ml-4 list-disc list-inside space-y-1">
            <li v-for="(error, index) in errors.common" :key="index">
              {{ error }}
            </li>
          </ul>
        </template>
      </div>

      <!-- Full Name Field (Input component) -->
      <div>
        <Input id="adminFullName" v-model="form.fullName" type="text" :label="t('admins.fullName')"
          :placeholder="t('admins.fullNamePlaceholder')" required :error="errors.fullName" />
      </div>
      <!-- Email Field (Input component) -->
      <div>
        <Input id="adminEmail" v-model="form.email" type="email" :label="t('admins.email')"
          :placeholder="t('admins.emailPlaceholder')" required :error="errors.email" autocomplete="off" />
      </div>

      <!-- Password Field (Input component + append slot for toggle) -->
      <div>
        <Input id="adminPassword" v-model="form.password" :type="showPassword ? 'text' : 'password'"
          :label="t('admins.password')" :placeholder="t('admins.passwordPlaceholder')" inputClass="pr-10" required
          autocomplete="new-password" :error="errors.password" @update:modelValue="validatePassword">
          <template #append>
            <button type="button" @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <ShowPasswordIcon v-if="showPassword" />
              <HidePasswordIcon v-else />
            </button>
          </template>
        </Input>
        <div v-if="form.password" class="mt-1">
          <div class="flex items-center space-x-1">
            <div class="flex-1 h-2 bg-gray-200 rounded-full">
              <div :class="['h-2 rounded-full transition-all', passwordStrengthColor]"
                :style="`width: ${passwordStrength}%`">
              </div>
            </div>
            <span :class="['text-xs', passwordStrengthTextColor]">{{ passwordStrengthText }}</span>
          </div>
        </div>
      </div>

      <!-- Confirm Password Field (Input component) -->
      <div>
        <Input id="confirmPassword" v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
          :label="t('admins.confirmPassword')" :placeholder="t('admins.confirmPasswordPlaceholder')" required
          inputClass="pr-10" :error="errors.confirmPassword">
          <template #append>
            <button type="button" @click="showConfirmPassword = !showConfirmPassword"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <ShowPasswordIcon v-if="showConfirmPassword" />
              <HidePasswordIcon v-else />
            </button>
          </template>
        </Input>
      </div>

      <!-- Admin Type Field (only for System Admins) -->
      <div v-if="currentUserIsSystemAdmin">
        <Checkbox v-model="form.isSystemAdmin" :label="t('admins.systemAdmin')" id="is-system-admin" />
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 pt-4">
        <Button variant="outline" type="button" :onClick="() => emit('close')">
          {{ t('common.cancel') }}
        </Button>
        <Button variant="primary" type="submit" :disabled="!isFormValid">
          {{ t('admins.createAdmin') }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CreateAdminRequest } from '@/types'
import { HidePasswordIcon, ShowPasswordIcon, useAppStore } from '@hivespace/shared'
import { useAdminStore } from '@/stores/admin.store'
import {
  useFieldValidation,
  validateEmail as validateEmailRule,
  validateMatches,
  validateMinLength,
  validatePasswordComplexity,
  validateRequired,
  Input,
  Button,
  Checkbox,
  type ErrorResponse,
} from '@hivespace/shared'

const { t } = useI18n()
const appStore = useAppStore()
const adminStore = useAdminStore()

defineProps<{
  currentUserIsSystemAdmin: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  isSystemAdmin: false,
})

// Form error types
interface FormErrors {
  common: string[]
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

const errors = reactive<FormErrors>({
  email: '',
  fullName: '',
  password: '',
  confirmPassword: '',
  common: [], // Array for general/non-field-specific errors
})

const { handleFieldValidationErrors: handleValidationErrors, clearFieldErrors: clearErrors } =
  useFieldValidation()

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordStrength = computed(() => {
  const password = form.password
  if (!password) return 0
  let score = 0
  if (password.length >= 12) score += 25
  if (password.length >= 16) score += 10
  if (/[a-z]/.test(password)) score += 15
  if (/[A-Z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 15
  if (/[^A-Za-z0-9]/.test(password)) score += 20
  return Math.min(score, 100)
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength < 30) return t('admins.passwordWeak')
  if (strength < 60) return t('admins.passwordFair')
  if (strength < 80) return t('admins.passwordGood')
  return t('admins.passwordStrong')
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength < 30) return 'bg-red-500'
  if (strength < 60) return 'bg-yellow-500'
  if (strength < 80) return 'bg-blue-500'
  return 'bg-green-500'
})

const passwordStrengthTextColor = computed(() => {
  const strength = passwordStrength.value
  if (strength < 30) return 'text-red-600'
  if (strength < 60) return 'text-yellow-600'
  if (strength < 80) return 'text-blue-600'
  return 'text-green-600'
})

const isFormValid = computed(() => {
  return (
    !!form.fullName &&
    !!form.email &&
    !!form.password &&
    !!form.confirmPassword &&
    !errors.fullName &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword &&
    form.password === form.confirmPassword &&
    passwordStrength.value >= 60
  )
})

const showSuccessNotification = (email: string) => {
  appStore.notifySuccess(
    t('admins.alerts.success.title'),
    t('admins.alerts.success.message', { email }),
  )
}

const showErrorNotification = () => {
  appStore.notifyError(t('admins.alerts.error.title'), t('admins.alerts.error.message'))
}

const validateAllFields = (): boolean => {
  // Clear previous errors before validation
  clearErrors(errors)
  return validateFullName() && validateEmail() && validatePassword() && validateConfirmPassword()
}

const createAdminData = (): CreateAdminRequest => {
  return {
    fullName: form.fullName.trim(),
    email: form.email.toLowerCase().trim(),
    password: form.password,
    confirmPassword: form.confirmPassword,
    isSystemAdmin: form.isSystemAdmin,
  }
}

const onCreate = async () => {
  // Clear previous errors and validate all fields
  clearErrors(errors)

  if (!validateAllFields()) {
    return
  }

  const adminData = createAdminData()

  try {
    // Call the store to create admin (store handles loading)
    const createdAdmin = await adminStore.createAdmin(adminData)

    // Show success notification and close modal
    showSuccessNotification(createdAdmin.email)
    emit('close')
  } catch (error: unknown) {
    // Handle API error response (API interceptor returns ErrorResponse directly)
    const errorData = error as ErrorResponse

    // Handle field-specific validation errors and common errors
    const hasFieldErrors = handleValidationErrors(errorData, errors)

    // Show notification only if no field or common errors were handled
    if (!hasFieldErrors) {
      showErrorNotification()
    }
  }
}

// Validation functions
const validateEmail = () => {
  const email = form.email.trim()
  const requiredError = validateRequired(email, t('admins.emailRequired') as string)
  if (requiredError) {
    errors.email = requiredError
    return false
  }

  const invalidError = validateEmailRule(email, t('admins.emailInvalid') as string)
  if (invalidError) {
    errors.email = invalidError
    return false
  }

  errors.email = ''
  return true
}

const validateFullName = () => {
  const requiredError = validateRequired(form.fullName, t('admins.fullNameRequired') as string)
  if (requiredError) {
    errors.fullName = requiredError
    return false
  }

  errors.fullName = ''
  return true
}

const validatePassword = () => {
  const password = form.password
  const requiredError = validateRequired(password, t('admins.passwordRequired') as string)
  if (requiredError) {
    errors.password = requiredError
    return false
  }

  const minLengthError = validateMinLength(password, 12, t('admins.passwordTooShort') as string)
  if (minLengthError) {
    errors.password = minLengthError
    return false
  }

  const complexityError = validatePasswordComplexity(
    password,
    {
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: true,
    },
    t('admins.passwordComplexity') as string,
  )
  if (complexityError) {
    errors.password = complexityError
    return false
  }

  errors.password = ''
  return true
}

const validateConfirmPassword = () => {
  const confirm = form.confirmPassword
  const requiredError = validateRequired(confirm, t('admins.confirmPasswordRequired') as string)
  if (requiredError) {
    errors.confirmPassword = requiredError
    return false
  }

  const matchError = validateMatches(
    confirm,
    form.password,
    t('admins.passwordMismatch') as string,
  )
  if (matchError) {
    errors.confirmPassword = matchError
    return false
  }

  errors.confirmPassword = ''
  return true
}
</script>

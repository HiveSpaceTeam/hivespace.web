import { defineComponent, ref } from 'vue'
import { defineStore } from 'pinia'
import { createNotificationStore } from '../../../../packages/shared/src/features/notifications/createNotificationStore'
import { NotificationChannel, NotificationStatus } from '../../../../packages/shared/src/features/notifications/notifications.types'
import type {
  INotificationService,
  InAppNotification,
  NotificationDto,
  NotificationHubEvent,
  NotificationListResponse,
} from '../../../../packages/shared/src/features/notifications/notifications.types'
import type { AppUser } from '../../../../packages/shared/src/types/app-user'
import type { PaginationMetadata } from '../../../../packages/shared/src/types/common.types'
import { Status, StatusFilter, UserType } from '../../../../packages/shared/src/types/common.types'
import {
  validateRequired,
  validatePositiveNumber,
  validateEmail,
  validateMinLength,
} from '../../../../packages/shared/src/composables/useValidationRules'

export type Environment = 'development' | 'staging' | 'production' | 'test'
export interface ApiConfig {
  baseURL: string
  timeout?: number
  retries?: number
  retryDelay?: number
  headers?: Record<string, string>
  features?: {
    enableDebug?: boolean
  }
}

export type SupportedCurrencyCode = 'VND' | 'USD' | 'EUR'
export type MoneyIssue = {
  code: 'missing_currency' | 'unsupported_currency' | 'invalid_amount' | 'invalid_money'
  placeholder?: string
}
export type PaymentMethodCode = 'COD' | 'VNPAY' | 'STRIPE' | string
export type PaymentMethodAvailability = 'Available' | 'Unavailable' | 'Future' | string
export type PaymentStatus = 'Pending' | 'Processing' | 'Succeeded' | 'Failed' | 'Cancelled' | 'Expired'

export const PAYMENT_STATUS = {
  Pending: 'Pending',
  Processing: 'Processing',
  Succeeded: 'Succeeded',
  Failed: 'Failed',
  Cancelled: 'Cancelled',
  Expired: 'Expired',
} as const

export const PENDING_PAYMENT_SESSION_KEY = 'hivespace_pending_payment'
export const PAYMENT_DISPLAY_SEPARATOR = ' / '

export const buildPaymentAttemptIdempotencyKey = (
  paymentId: string,
  timestamp = Date.now(),
) => `payment-attempt:${paymentId}:${timestamp}`

export const isTerminalPaymentStatus = (status: PaymentStatus) =>
  ['Succeeded', 'Failed', 'Cancelled', 'Expired'].includes(status)

export const isRetryablePaymentStatus = (status: PaymentStatus) =>
  ['Failed', 'Cancelled', 'Expired'].includes(status)

export const normalizePaymentStatus = (status?: string | null): PaymentStatus | null => {
  switch (status?.toLowerCase()) {
    case 'success':
    case 'succeeded':
      return 'Succeeded'
    case 'fail':
    case 'failed':
    case 'failure':
      return 'Failed'
    case 'cancelled':
    case 'canceled':
      return 'Cancelled'
    case 'expired':
      return 'Expired'
    case 'pending':
      return 'Pending'
    case 'processing':
      return 'Processing'
    default:
      return null
  }
}

export const paymentStatusLabelKey = (status: PaymentStatus) =>
  `common.payments.status.${status.toLowerCase()}`

export const paymentAvailabilityLabelKey = (availability: PaymentMethodAvailability) =>
  `common.payments.methods.availability.${String(availability).toLowerCase()}`

export interface PaymentMethodMetadata {
  code: PaymentMethodCode
  displayName: string
  kind: string
  gatewayCode: string | null
  isEnabled: boolean
  isCheckoutSelectable: boolean
  availability: PaymentMethodAvailability
  sortOrder: number
}

export interface PaymentAttempt {
  id: string
  attemptNo: number
  methodCode: PaymentMethodCode
  gatewayCode?: string | null
  status: PaymentStatus
  redirectUrl?: string | null
  gatewayTransactionId?: string | null
  failureReasonCode?: string | null
  createdAt: string
  expiresAt?: string | null
  completedAt?: string | null
}

export interface PaymentDetail {
  id: string
  paymentId?: string
  referenceNo?: string | null
  orderId?: string | null
  buyerId?: string | null
  amount: { amount: number | null; currencyCode: SupportedCurrencyCode | null; issue?: MoneyIssue | null }
  currency?: string | null
  currencyCode?: string | null
  moneyIssue?: MoneyIssue | null
  status: PaymentStatus
  methodCode?: PaymentMethodCode | null
  method?: Partial<PaymentMethodMetadata> | null
  gateway?: { code?: string | null; gatewayTransactionId?: string | null } | string | null
  gatewayTransactionId?: string | null
  gatewayPaymentUrl?: string | null
  latestAttempt?: PaymentAttempt | null
  attempts?: PaymentAttempt[]
  linkedOrders?: Array<{
    orderId: string
    orderCode?: string | null
    storeId?: string | null
    amount?: { amount: number | null; currencyCode: SupportedCurrencyCode | null; issue?: MoneyIssue | null } | null
  }>
  paidAt?: string | null
  expiresAt?: string | null
  createdAt?: string | null
}

export { createNotificationStore, NotificationChannel, NotificationStatus, Status, StatusFilter, UserType }
export { validateRequired, validatePositiveNumber, validateEmail, validateMinLength }
export type {
  AppUser,
  INotificationService,
  InAppNotification,
  NotificationDto,
  NotificationHubEvent,
  NotificationListResponse,
  PaginationMetadata,
}

export const CULTURE_TEXT = {
  ENGLISH: 'en',
  VIETNAMESE: 'vi',
} as const

export const en = {}
export const vi = {}

export const normalizeFrontendRedirect = (returnUrl: unknown, fallback: string): string =>
  typeof returnUrl === 'string' && returnUrl.startsWith('/') ? returnUrl : fallback

export const useCooldown = (_durationSeconds = 60) => ({
  isActive: ref(false),
  secondsRemaining: ref(_durationSeconds),
  start: () => undefined,
  stop: () => undefined,
})

export const validateUrl = (value: string | undefined, fallback = 'http://localhost:5000') =>
  value || fallback

export const validateEnvironment = (value: string | undefined): Environment => {
  if (value === 'staging' || value === 'production' || value === 'test') return value
  return 'development'
}

export const parseBoolean = (value: string | undefined, fallback = false) => {
  if (value === undefined) return fallback
  return value === 'true'
}

export const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const joinUrl = (...parts: string[]) =>
  parts
    .filter(Boolean)
    .map((part, index) => (index === 0 ? part.replace(/\/+$/, '') : part.replace(/^\/+|\/+$/g, '')))
    .join('/')

export class ApiService {
  constructor(public readonly config: ApiConfig) {}

  get<T>(): Promise<T> {
    return Promise.resolve(undefined as T)
  }

  post<T>(): Promise<T> {
    return Promise.resolve(undefined as T)
  }

  put<T>(): Promise<T> {
    return Promise.resolve(undefined as T)
  }

  delete<T>(): Promise<T> {
    return Promise.resolve(undefined as T)
  }
}

export class BaseService {
  get<T>(): Promise<T> {
    return Promise.resolve(undefined as T)
  }

  post<T>(): Promise<T> {
    return Promise.resolve(undefined as T)
  }

  put<T>(): Promise<T> {
    return Promise.resolve(undefined as T)
  }

  delete<T>(): Promise<T> {
    return Promise.resolve(undefined as T)
  }
}

export const useAppStore = defineStore('app', () => {
  const setLoading = () => undefined
  const notifySuccess = () => ''
  const notifyError = () => ''
  const notifyWarning = () => ''
  const notifyInfo = () => ''

  return {
    setLoading,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  }
})

export const useAsyncAction = () => {
  const isLoading = ref(false)
  const error = ref<unknown>(null)

  const run = async <T>(action: () => Promise<T>): Promise<T> => {
    isLoading.value = true
    error.value = null
    try {
      return await action()
    } catch (err) {
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    run,
  }
}

export const useAuth = () => ({
  currentUser: ref<AppUser | null>(null),
  getCurrentUser: async () => null,
  logout: async () => undefined,
  login: async () => undefined,
})

export const createNotificationService = () => ({
  getNotifications: async () => ({ notifications: [], hasMore: false }),
  getUnreadCount: async () => 0,
  markAsRead: async () => undefined,
})

export const createMediaUploadService = () => ({
  presignUpload: async () => ({ url: 'https://fake-presign.test/upload', uploadRef: 'fake-ref' }),
  confirmUpload: async () => ({ confirmed: true, mediaId: 'fake-ref' }),
})

export const createUserProfileService = () => ({
  getProfile: async () => null,
  updateProfile: async () => null,
})

export const createUserSettingsService = () => ({
  fetchUserSettings: async () => null,
  updateUserSettings: async () => null,
})

export const createUserSettingsStore = (opts?: { service?: { getUserSetting?: () => Promise<unknown>; setUserSetting?: (s: unknown) => Promise<void> } }) =>
  defineStore('user-settings', () => {
    const userSettings = ref<{ theme: string; culture: string }>({ theme: 'light', culture: 'vi' })
    const fetchUserSettings = async () => {
      const settings = opts?.service?.getUserSetting ? await opts.service.getUserSetting() : { theme: 'light', culture: 'vi' }
      userSettings.value = settings as { theme: string; culture: string }
      return settings
    }
    const updateUserSettings = async (settings: { theme: string; culture: string }) => {
      if (opts?.service?.setUserSetting) await opts.service.setUserSetting(settings)
      userSettings.value = settings
    }
    const updateTheme = async (theme: string) => updateUserSettings({ ...userSettings.value, theme })
    const updateCulture = async (culture: string) => updateUserSettings({ ...userSettings.value, culture })
    const getCurrentTheme = () => userSettings.value.theme
    const getCurrentCulture = () => userSettings.value.culture
    return { userSettings, fetchUserSettings, updateUserSettings, updateTheme, updateCulture, getCurrentTheme, getCurrentCulture }
  })

export const createUserProfileStore = (opts?: { service?: { getMyProfile?: () => Promise<unknown> } }) =>
  defineStore('profile', () => {
    const myProfile = ref<unknown | null>(null)
    const fetchMyProfile = async () => {
      const profile = opts?.service?.getMyProfile ? await opts.service.getMyProfile() : null
      myProfile.value = profile
      return profile
    }
    const setMyProfile = (p: unknown) => { myProfile.value = p }
    const clearMyProfile = () => { myProfile.value = null }
    return { myProfile, fetchMyProfile, setMyProfile, clearMyProfile }
  })

export const createMediaUploadStore = () =>
  defineStore('media-upload', () => ({
    uploadProgress: ref(0),
    isUploading: ref(false),
    uploadFile: async () => ({ mediaId: 'fake-ref' }),
    reset: () => undefined,
  }))

export const useFormatDate = () => ({
  formatRelativeTime: (value: string) => value,
})

export const AppShell = defineComponent({
  template: '<div data-testid="app-shell"><slot /></div>',
})

export const PageBreadcrumb = defineComponent({
  props: { pageTitle: String },
  template: '<div data-testid="page-breadcrumb"><slot /><slot name="actions" /></div>',
})

export const Spinner = defineComponent({
  props: {
    size: {
      type: String,
      default: 'md',
    },
  },
  template: '<span data-testid="spinner" />',
})

export const FullscreenLoader = defineComponent({
  props: {
    visible: { type: Boolean, default: false },
    message: { type: String, default: '' },
  },
  template: '<div v-if="visible" data-testid="fullscreen-loader">{{ message }}</div>',
})

export const Button = defineComponent({
  emits: ['click'],
  template: '<button type="button" @click="$emit(\'click\', $event)"><slot /></button>',
})

export const Input = defineComponent({
  props: { modelValue: { type: String, default: '' }, placeholder: String },
  emits: ['update:modelValue'],
  template: '<input :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
})

export const Badge = defineComponent({
  template: '<span><slot /></span>',
})

export const Checkbox = defineComponent({
  props: { modelValue: { type: Boolean, default: false } },
  emits: ['change'],
  template:
    '<label><input type="checkbox" :checked="modelValue" @change="$emit(\'change\', $event.target.checked)" /><slot /></label>',
})

export const useModal = () => ({
  openModal: async () => null,
  closeModal: () => undefined,
})

export const NotificationBellIcon = defineComponent({
  template: '<span data-testid="notification-bell-icon" />',
})

export const Maintenance = defineComponent({
  template: '<div data-testid="maintenance" />',
})

export const NotFound = defineComponent({
  template: '<div data-testid="not-found" />',
})

export const ServerError = defineComponent({
  template: '<div data-testid="server-error" />',
})

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

export type Environment = 'development' | 'staging' | 'production' | 'test'
export interface MyProfile {
  id?: string
  displayName?: string
  email?: string
  avatarUrl?: string | null
}
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

export { createNotificationStore, NotificationChannel, NotificationStatus }
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

export const validateRequired = (
  value: string | number | boolean | null | undefined,
  message: string,
): string => {
  if (typeof value === 'string') return value.trim() ? '' : message
  return value === null || value === undefined ? message : ''
}

export const validatePositiveNumber = (
  value: number | string | null | undefined,
  message: string,
): string => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? '' : message
}

export const validateEmail = (value: string, message: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value.trim()) ? '' : message
}

export const useCooldown = (_durationSeconds = 60) => ({
  isActive: ref(false),
  secondsRemaining: ref(_durationSeconds),
  start: () => undefined,
  stop: () => undefined,
})

export const getPendingVerificationEmail = (): string | null => null
export const setPendingVerificationEmail = (): void => undefined
export const clearPendingVerificationEmail = (): void => undefined

export const normalizeFrontendRedirect = (returnUrl: unknown, fallback: string): string =>
  typeof returnUrl === 'string' && returnUrl.startsWith('/') ? returnUrl : fallback

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

export const createMediaUploadStore = (opts?: { service?: { presignUrl?: (req: unknown) => Promise<{ uploadUrl: string; fileId: string }>; uploadToBlob?: (url: string, file: File) => Promise<void>; confirmUpload?: (id: string, entityId: string) => Promise<void> } }) =>
  defineStore('media', () => {
    const isLoading = ref(false)
    const uploadMedia = async (file: File, entityType: string, entityId?: string) => {
      isLoading.value = true
      try {
        const presignResponse = opts?.service?.presignUrl
          ? await opts.service.presignUrl({ fileName: file.name, contentType: file.type, fileSize: file.size, entityType, entityId })
          : { uploadUrl: '', fileId: '' }
        if (opts?.service?.uploadToBlob && presignResponse.uploadUrl) {
          await opts.service.uploadToBlob(presignResponse.uploadUrl, file)
        }
        return presignResponse
      } finally {
        isLoading.value = false
      }
    }
    const presignUrl = async (request: unknown) => {
      return opts?.service?.presignUrl ? opts.service.presignUrl(request) : { uploadUrl: '', fileId: '' }
    }
    const confirmUpload = async (id: string, entityId: string) => {
      if (opts?.service?.confirmUpload) await opts.service.confirmUpload(id, entityId)
    }
    return { isLoading, uploadMedia, presignUrl, confirmUpload }
  })

export const useFormatDate = () => ({
  formatRelativeTime: (value: string) => value,
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
    visible: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: '',
    },
  },
  template: '<div v-if="visible" data-testid="fullscreen-loader">{{ message }}</div>',
})

export const Button = defineComponent({
  emits: ['click'],
  template: '<button type="button" @click="$emit(\'click\', $event)"><slot /></button>',
})

export const Badge = defineComponent({
  template: '<span><slot /></span>',
})

export const Checkbox = defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change'],
  template:
    '<label><input type="checkbox" :checked="modelValue" @change="$emit(\'change\', $event.target.checked)" /><slot /></label>',
})

export const QuantityControl = defineComponent({
  props: {
    modelValue: {
      type: Number,
      default: 1,
    },
  },
  emits: ['update:modelValue'],
  template:
    '<div><button type="button" aria-label="decrease" @click="$emit(\'update:modelValue\', modelValue - 1)">-</button><span>{{ modelValue }}</span><button type="button" aria-label="increase" @click="$emit(\'update:modelValue\', modelValue + 1)">+</button></div>',
})

export const RadioGroup = defineComponent({
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:modelValue'],
  template:
    '<div><button v-for="option in options" :key="option.value" type="button" @click="$emit(\'update:modelValue\', option.value)"><slot name="option" :option="option">{{ option.label }}</slot></button></div>',
})

export const Avatar = defineComponent({
  template: '<span data-testid="avatar" />',
})

export const OrderTimeline = defineComponent({
  props: {
    steps: {
      type: Array,
      default: () => [],
    },
  },
  template: '<ol data-testid="order-timeline"><li v-for="step in steps" :key="step.key">{{ step.label }}</li></ol>',
})

export type TimelineStep = {
  key: string
  label: string
  timestamp?: string | null
  isCompleted: boolean
  isCurrent: boolean
}

export const useModal = () => ({
  openModal: async () => null,
  closeModal: () => undefined,
})

export const useConfirmModal = () => ({
  confirm: async () => true,
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

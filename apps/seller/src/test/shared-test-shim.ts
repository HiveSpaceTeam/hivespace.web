import { defineComponent, ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { createNotificationStore } from '../../../../packages/shared/src/features/notifications/createNotificationStore'
import { createMediaUploadStore } from '../../../../packages/shared/src/features/media-upload/createMediaUploadStore'
import { createUserProfileStore } from '../../../../packages/shared/src/features/user-profile/createUserProfileStore'
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

export { createNotificationStore, createMediaUploadStore, createUserProfileStore, NotificationChannel, NotificationStatus }
export type {
  AppUser,
  INotificationService,
  InAppNotification,
  NotificationDto,
  NotificationHubEvent,
  NotificationListResponse,
  PaginationMetadata,
}

// Seller-specific enums that ship in @hivespace/shared
export enum DiscountType {
  FixedAmount = 1,
  Percentage = 2,
}

export enum CouponScope {
  ShippingFee = 1,
  ItemPrice = 2,
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

export const validateMinLength = (value: string, min: number, message: string): string =>
  value.length >= min ? '' : message

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
  // Extra constructor args (ensureFreshUser, notifyCallback, getTranslations) are accepted but unused in tests
  constructor(public readonly config: ApiConfig, ..._args: unknown[]) {}

  getClient() {
    return {
      defaults: { headers: { common: {} as Record<string, string> } },
      interceptors: {
        request: { use: () => 0, eject: () => undefined },
        response: { use: () => 0, eject: () => undefined },
      },
      get: () => Promise.resolve({ data: undefined, status: 200 }),
      post: () => Promise.resolve({ data: undefined, status: 200 }),
      put: () => Promise.resolve({ data: undefined, status: 200 }),
      delete: () => Promise.resolve({ data: undefined, status: 200 }),
    }
  }

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

export const useNumberInputFormatter = (_value: Ref, _locale?: string) => ({
  displayValue: ref(''),
  handleInput: (_event: Event) => undefined,
  handleBlur: () => undefined,
  handleFocus: () => undefined,
  formatNumber: (_val: string | number | null | undefined) => '',
})

export const useFormatDate = () => ({
  formatRelativeTime: (value: string) => value,
  formatDateTime: (value: string) => value,
})

export const useFieldValidation = () => ({
  errors: ref<Record<string, string>>({}),
  setError: (_field: string, _message: string) => undefined,
  clearErrors: () => undefined,
  hasErrors: false,
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

export const Pagination = defineComponent({
  props: {
    modelValue: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
  },
  emits: ['update:modelValue'],
  template: '<div data-testid="pagination" />',
})

export const FilterChips = defineComponent({
  props: { modelValue: { type: String, default: '' }, options: { type: Array, default: () => [] } },
  emits: ['update:modelValue'],
  template: '<div data-testid="filter-chips" />',
})

export const Input = defineComponent({
  props: { modelValue: { type: String, default: '' } },
  emits: ['update:modelValue'],
  template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
})

export const TextArea = defineComponent({
  props: { modelValue: { type: String, default: '' } },
  emits: ['update:modelValue'],
  template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
})

export const DateTimePicker = defineComponent({
  name: 'DateTimePicker',
  props: { modelValue: { type: String, default: '' } },
  emits: ['update:modelValue'],
  template: '<input type="text" data-testid="date-picker" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)" />',
})

export const Select = defineComponent({
  props: { modelValue: { type: [String, Number], default: '' }, options: { type: Array, default: () => [] } },
  emits: ['update:modelValue'],
  template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
})

export const AppShell = defineComponent({
  template: '<div data-testid="app-shell"><slot /><slot name="sidebar" /></div>',
})

export const AppSidebar = defineComponent({
  template: '<nav data-testid="app-sidebar"><slot /></nav>',
})

export const AppHeader = defineComponent({
  template: '<header data-testid="app-header"><slot /></header>',
})

export const DropdownMenu = defineComponent({
  template: '<div data-testid="dropdown-menu"><slot /></div>',
})

export const ConfirmModal = defineComponent({
  props: { title: String, message: String },
  emits: ['confirm', 'cancel'],
  template: '<div data-testid="confirm-modal"><slot /></div>',
})

export const PageBreadcrumb = defineComponent({
  props: { pageTitle: String },
  template: '<div data-testid="page-breadcrumb" />',
})

export const ComponentCard = defineComponent({
  props: { title: String },
  template: '<div data-testid="component-card"><slot /></div>',
})

export const Tabs = defineComponent({
  props: { modelValue: { type: String, default: '' }, options: { type: Array, default: () => [] } },
  emits: ['update:modelValue'],
  template: '<div data-testid="tabs" />',
})

export const MultipleSelect = defineComponent({
  props: { modelValue: { type: Array, default: () => [] }, options: { type: Array, default: () => [] } },
  emits: ['update:modelValue'],
  template: '<div data-testid="multiple-select" />',
})

export const FileInput = defineComponent({
  props: { modelValue: { type: [String, Object], default: null } },
  emits: ['update:modelValue'],
  template: '<input type="file" data-testid="file-input" />',
})

// Icon stubs
const iconStub = { template: '<span />' }
export const BigPlusIcon = defineComponent(iconStub)
export const EditIcon = defineComponent(iconStub)
export const RefreshIcon = defineComponent(iconStub)
export const TrashRedIcon = defineComponent(iconStub)
export const TrashIcon = defineComponent(iconStub)
export const PlusIcon = defineComponent(iconStub)
export const EyeIcon = defineComponent(iconStub)
export const ArrowDownRedIcon = defineComponent(iconStub)
export const ListIcon = defineComponent(iconStub)
export const MailIcon = defineComponent(iconStub)
export const BoxIcon = defineComponent(iconStub)
export const CloseIcon = defineComponent(iconStub)
export const CopyIcon = defineComponent(iconStub)
export const FixedAmountIcon = defineComponent(iconStub)
export const GridIcon = defineComponent(iconStub)
export const HorizontalDots = defineComponent(iconStub)
export const LockIcon = defineComponent(iconStub)
export const PercentageIcon = defineComponent(iconStub)

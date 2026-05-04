import { ApiService } from '@hivespace/shared'
import type { ApiConfig } from '@hivespace/shared'
import { config } from '@/config'
import i18n from '@/i18n'

const apiConfig: ApiConfig = {
  baseURL: new URL('/api', config.api.baseUrl).toString(),
  timeout: config.api.timeout,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  features: {
    enableDebug: config.features.enableDebug
  }
}

const notifyCallback = (title: string, message: string) => {
  import('@hivespace/shared').then(({ useAppStore }) => {
    const appStore = useAppStore()
    appStore.notifyError(title, message)
  }).catch(err => console.error('Failed to notify error', err))
}

const getTranslations = () => ({
  unauthorized: {
    title: i18n.global.t('errors.UNAUTHORIZED.title'),
    message: i18n.global.t('errors.UNAUTHORIZED.message'),
  },
  accessDenied: {
    title: i18n.global.t('errors.ACCESS_DENIED.title'),
    message: i18n.global.t('errors.ACCESS_DENIED.message'),
  },
  tooManyRequests: {
    title: i18n.global.t('errors.TOO_MANY_REQUESTS.title'),
    message: i18n.global.t('errors.TOO_MANY_REQUESTS.message'),
  },
  serverError: {
    title: i18n.global.t('errors.SERVER_ERROR.title'),
    message: i18n.global.t('errors.SERVER_ERROR.message'),
  },
  serviceUnavailable: {
    title: i18n.global.t('errors.SERVICE_UNAVAILABLE.title'),
    message: i18n.global.t('errors.SERVICE_UNAVAILABLE.message'),
  },
  connectionError: {
    title: i18n.global.t('errors.CONNECTION_ERROR.title'),
    message: i18n.global.t('errors.CONNECTION_ERROR.message'),
  },
  requestError: {
    title: i18n.global.t('errors.REQUEST_ERROR.title'),
    message: i18n.global.t('errors.REQUEST_ERROR.message'),
  },
})

export const apiService = new ApiService(apiConfig, undefined, notifyCallback, getTranslations)
export const apiClient = apiService.getClient()


// Export types
export type { ApiConfig }

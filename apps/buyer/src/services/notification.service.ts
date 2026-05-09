import { createNotificationService } from '@hivespace/shared'
import { apiService } from './api'
import { buildApiUrl } from '@/config'

export const notificationService = createNotificationService({ apiService, buildApiUrl })

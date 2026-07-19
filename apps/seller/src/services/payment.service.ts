import { createPaymentService } from '@hivespace/shared'
import { buildApiUrl } from '@/config'
import { apiService } from './api'

export const paymentService = createPaymentService({ apiService, buildApiUrl })

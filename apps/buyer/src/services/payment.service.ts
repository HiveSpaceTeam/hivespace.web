import { createPaymentService } from '@hivespace/shared'
import { apiService } from './api'
import { buildApiUrl } from '@/config'

export const paymentService = createPaymentService({ apiService, buildApiUrl })

import type { PaymentMethodAvailability, PaymentStatus } from './payment.types'

export const PAYMENT_STATUS = {
  Pending: 'Pending',
  Processing: 'Processing',
  Succeeded: 'Succeeded',
  Failed: 'Failed',
  Cancelled: 'Cancelled',
  Expired: 'Expired',
} as const satisfies Record<PaymentStatus, PaymentStatus>

export const TERMINAL_PAYMENT_STATUSES = [
  PAYMENT_STATUS.Succeeded,
  PAYMENT_STATUS.Failed,
  PAYMENT_STATUS.Cancelled,
  PAYMENT_STATUS.Expired,
] as const satisfies readonly PaymentStatus[]

export const RETRYABLE_PAYMENT_STATUSES = [
  PAYMENT_STATUS.Failed,
  PAYMENT_STATUS.Cancelled,
  PAYMENT_STATUS.Expired,
] as const satisfies readonly PaymentStatus[]

export const PENDING_PAYMENT_SESSION_KEY = 'hivespace_pending_payment'

export const PAYMENT_ATTEMPT_IDEMPOTENCY_PREFIX = 'payment-attempt'

export const PAYMENT_DISPLAY_SEPARATOR = ' / '

export const buildPaymentAttemptIdempotencyKey = (
  paymentId: string,
  timestamp = Date.now(),
) => `${PAYMENT_ATTEMPT_IDEMPOTENCY_PREFIX}:${paymentId}:${timestamp}`

export const isTerminalPaymentStatus = (status: PaymentStatus) =>
  (TERMINAL_PAYMENT_STATUSES as readonly PaymentStatus[]).includes(status)

export const isRetryablePaymentStatus = (status: PaymentStatus) =>
  (RETRYABLE_PAYMENT_STATUSES as readonly PaymentStatus[]).includes(status)

export const normalizePaymentStatus = (status?: string | null): PaymentStatus | null => {
  switch (status?.toLowerCase()) {
    case 'success':
    case 'succeeded':
      return PAYMENT_STATUS.Succeeded
    case 'fail':
    case 'failed':
    case 'failure':
      return PAYMENT_STATUS.Failed
    case 'cancelled':
    case 'canceled':
      return PAYMENT_STATUS.Cancelled
    case 'expired':
      return PAYMENT_STATUS.Expired
    case 'pending':
      return PAYMENT_STATUS.Pending
    case 'processing':
      return PAYMENT_STATUS.Processing
    default:
      return null
  }
}

export const paymentStatusLabelKey = (status: PaymentStatus) =>
  `common.payments.status.${status.toLowerCase()}`

export const paymentAvailabilityLabelKey = (availability: PaymentMethodAvailability) =>
  `common.payments.methods.availability.${String(availability).toLowerCase()}`

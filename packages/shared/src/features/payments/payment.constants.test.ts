import {
  buildPaymentAttemptIdempotencyKey,
  isRetryablePaymentStatus,
  isTerminalPaymentStatus,
  normalizePaymentStatus,
  paymentAvailabilityLabelKey,
  paymentStatusLabelKey,
} from './payment.constants'

describe('payment constants helpers', () => {
  it('normalizes provider callback status aliases', () => {
    expect(normalizePaymentStatus('success')).toBe('Succeeded')
    expect(normalizePaymentStatus('failure')).toBe('Failed')
    expect(normalizePaymentStatus('canceled')).toBe('Cancelled')
    expect(normalizePaymentStatus('processing')).toBe('Processing')
    expect(normalizePaymentStatus('unknown')).toBeNull()
  })

  it('classifies terminal and retryable statuses', () => {
    expect(isTerminalPaymentStatus('Succeeded')).toBe(true)
    expect(isTerminalPaymentStatus('Pending')).toBe(false)
    expect(isRetryablePaymentStatus('Failed')).toBe(true)
    expect(isRetryablePaymentStatus('Succeeded')).toBe(false)
  })

  it('builds stable display keys and idempotency keys', () => {
    expect(paymentStatusLabelKey('Expired')).toBe('common.payments.status.expired')
    expect(paymentAvailabilityLabelKey('Future')).toBe(
      'common.payments.methods.availability.future',
    )
    expect(buildPaymentAttemptIdempotencyKey('payment-001', 12345)).toBe(
      'payment-attempt:payment-001:12345',
    )
  })
})

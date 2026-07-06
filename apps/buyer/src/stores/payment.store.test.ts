import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { paymentService } from '@/services/payment.service'
import { usePaymentStore } from './payment.store'

jest.mock('@/services/payment.service', () => ({
  paymentService: {
    getPaymentByOrder: jest.fn(),
  },
}))

describe('usePaymentStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(paymentService.getPaymentByOrder).mockResolvedValue({
      paymentId: 'payment-001',
      orderId: 'order-001',
      buyerId: 'buyer-001',
      amount: 200_000,
      currency: 'VND',
      status: 'Succeeded',
      gateway: 'vnpay',
      gatewayTransactionId: 'gateway-001',
      gatewayPaymentUrl: null,
      paidAt: '2026-06-12T00:00:00Z',
      expiresAt: '2026-06-12T01:00:00Z',
      createdAt: '2026-06-12T00:00:00Z',
    })
  })

  it('should fetch payment result by order id', async () => {
    const store = usePaymentStore()

    const result = await store.fetchPaymentByOrder('order-001')

    expect(paymentService.getPaymentByOrder).toHaveBeenCalledWith('order-001')
    expect(result.status).toBe('Succeeded')
    expect(store.payment?.gatewayTransactionId).toBe('gateway-001')
    expect(store.payment?.currencyCode).toBe('VND')
    expect(store.payment?.moneyIssue).toBeNull()
  })

  it('should mark missing currencies with invalid-money metadata', async () => {
    jest.mocked(paymentService.getPaymentByOrder).mockResolvedValueOnce({
      paymentId: 'payment-002',
      orderId: 'order-002',
      buyerId: 'buyer-001',
      amount: 1_050,
      currency: null,
      currencyCode: null,
      status: 'Succeeded',
      gateway: 'stripe',
      gatewayTransactionId: 'gateway-002',
      gatewayPaymentUrl: null,
      paidAt: '2026-06-12T00:00:00Z',
      expiresAt: '2026-06-12T01:00:00Z',
      createdAt: '2026-06-12T00:00:00Z',
    })
    const store = usePaymentStore()

    await store.fetchPaymentByOrder('order-002')

    expect(store.payment?.currencyCode).toBeNull()
    expect(store.payment?.moneyIssue?.code).toBe('missing_currency')
  })
})

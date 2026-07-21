import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { usePaymentStore } from './payment.store'
import { paymentService } from '@/services/payment.service'
import type { PaymentDetail } from '@hivespace/shared'

const mockSetLoading = jest.fn()

jest.mock('@/services/payment.service', () => ({
  paymentService: {
    getPaymentByReference: jest.fn(),
    getPaymentByOrder: jest.fn(),
  },
}))

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')

  return {
    ...actual,
    useAppStore: () => ({ setLoading: mockSetLoading }),
  }
})

const paymentFixture: PaymentDetail = {
  id: 'payment-001',
  referenceNo: 'PAY-01JZXYZABCDEABCDEABCDEABC',
  method: {
    code: 'VNPAY',
    displayName: 'VNPay',
    kind: 'Online',
    availability: 'Available',
  },
  status: 'Succeeded',
  amount: {
    amount: 12500000,
    currencyCode: 'VND',
  },
  latestAttempt: {
    id: 'attempt-002',
    attemptNo: 2,
    methodCode: 'VNPAY',
    gatewayCode: 'VNPAY',
    status: 'Succeeded',
    gatewayTransactionId: 'VNPAY-TRANSACTION-ID',
    createdAt: '2026-07-11T10:15:00Z',
    completedAt: '2026-07-11T10:18:00Z',
  },
  attempts: [
    {
      id: 'attempt-001',
      attemptNo: 1,
      methodCode: 'VNPAY',
      gatewayCode: 'VNPAY',
      status: 'Expired',
      failureReasonCode: 'Expired',
      createdAt: '2026-07-11T09:55:00Z',
      completedAt: '2026-07-11T10:10:00Z',
    },
  ],
  linkedOrders: [
    {
      orderId: 'order-001',
      orderCode: 'ORD-01JZXYZABCDEABCDEABCDEABD',
      storeId: 'store-001',
      amount: {
        amount: 6500000,
        currencyCode: 'VND',
      },
    },
  ],
}

describe('usePaymentStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
    jest.mocked(paymentService.getPaymentByReference).mockResolvedValue(paymentFixture)
    jest.mocked(paymentService.getPaymentByOrder).mockResolvedValue(paymentFixture)
  })

  it('should fetch payment detail by public reference', async () => {
    const store = usePaymentStore()

    const result = await store.fetchPaymentByReference('PAY-01JZXYZABCDEABCDEABCDEABC')

    expect(paymentService.getPaymentByReference).toHaveBeenCalledWith(
      'PAY-01JZXYZABCDEABCDEABCDEABC',
    )
    expect(result.referenceNo).toBe('PAY-01JZXYZABCDEABCDEABCDEABC')
    expect(store.payment?.linkedOrders?.[0]?.orderCode).toBe('ORD-01JZXYZABCDEABCDEABCDEABD')
    expect(store.payment?.latestAttempt?.attemptNo).toBe(2)
    expect(mockSetLoading).toHaveBeenNthCalledWith(1, true)
    expect(mockSetLoading).toHaveBeenLastCalledWith(false)
  })

  it('should clear payment detail', () => {
    const store = usePaymentStore()
    store.payment = paymentFixture

    store.clearPayment()

    expect(store.payment).toBeNull()
  })

  it('should fetch payment detail by linked order id', async () => {
    const store = usePaymentStore()

    const result = await store.fetchPaymentByOrder('order-001')

    expect(paymentService.getPaymentByOrder).toHaveBeenCalledWith('order-001')
    expect(result.referenceNo).toBe('PAY-01JZXYZABCDEABCDEABCDEABC')
    expect(store.payment?.linkedOrders?.[0]?.orderId).toBe('order-001')
  })
})

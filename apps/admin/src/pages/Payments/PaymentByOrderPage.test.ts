import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import PaymentByOrderPage from './PaymentByOrderPage.vue'
import { paymentService } from '@/services/payment.service'
import type { PaymentDetail } from '@hivespace/shared'

const mockSetLoading = jest.fn()

jest.mock('@/services/payment.service', () => ({
  paymentService: {
    getPaymentByOrder: jest.fn(),
  },
}))

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')

  return {
    ...actual,
    AppShell: { template: '<div><slot /></div>' },
    PageBreadcrumb: { template: '<div />', props: ['pageTitle'] },
    Spinner: { template: '<div />' },
    useMoneyFormatter: () => ({
      formatMoney: (money: { amount: number; currencyCode?: string | null }) =>
        `${money.amount} ${money.currencyCode ?? ''}`.trim(),
    }),
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

const renderPage = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  i18n.global.locale.value = 'en'
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/payments/by-order/:orderId',
        name: 'PaymentByOrder',
        component: PaymentByOrderPage,
      },
      {
        path: '/payments',
        name: 'Payments',
        component: { template: '<div />' },
      },
    ],
  })
  await router.push('/payments/by-order/order-001')
  await router.isReady()

  render(PaymentByOrderPage, {
    global: {
      plugins: [pinia, i18n, router],
    },
  })
}

describe('PaymentByOrderPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(paymentService.getPaymentByOrder).mockResolvedValue(paymentFixture)
  })

  it('should load payment detail by order id and display traceability fields', async () => {
    await renderPage()

    await waitFor(() => {
      expect(paymentService.getPaymentByOrder).toHaveBeenCalledWith('order-001')
    })

    expect(screen.getByText('ORD-01JZXYZABCDEABCDEABCDEABD')).toBeTruthy()
    expect(screen.getByText('PAY-01JZXYZABCDEABCDEABCDEABC')).toBeTruthy()
    expect(screen.getByText('VNPay')).toBeTruthy()
    expect(screen.getByText('Succeeded')).toBeTruthy()
    expect(screen.getByText(/Attempt 2/)).toBeTruthy()
    expect(screen.getByText('VNPAY-TRANSACTION-ID')).toBeTruthy()
  })
})

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import PaymentLookupPage from './PaymentLookupPage.vue'
import { paymentService } from '@/services/payment.service'
import { usePaymentStore } from '@/stores/payment.store'
import type { PaymentDetail } from '@hivespace/shared'

const mockSetLoading = jest.fn()

jest.mock('@/services/payment.service', () => ({
  paymentService: {
    getPaymentByReference: jest.fn(),
  },
}))

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')

  return {
    ...actual,
    AppShell: { template: '<div><slot /></div>' },
    PageBreadcrumb: { template: '<div />', props: ['pageTitle'] },
    Button: {
      template: '<button :type="type ?? \'button\'" :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
      props: ['type', 'variant', 'size', 'disabled'],
      emits: ['click'],
    },
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

const renderPage = async (path = '/payments') => {
  const pinia = createPinia()
  setActivePinia(pinia)
  i18n.global.locale.value = 'en'
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/payments',
        name: 'Payments',
        component: PaymentLookupPage,
      },
      {
        path: '/payments/by-order/:orderId',
        name: 'PaymentByOrder',
        component: { template: '<div />' },
      },
    ],
  })
  await router.push(path)
  await router.isReady()

  return render(PaymentLookupPage, {
    global: {
      plugins: [pinia, i18n, router],
    },
  })
}

describe('PaymentLookupPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
    jest.mocked(paymentService.getPaymentByReference).mockResolvedValue(paymentFixture)
  })

  it('should search payment by reference and render linked orders and attempts', async () => {
    await renderPage()

    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('payments.lookup.label')),
      'PAY-01JZXYZABCDEABCDEABCDEABC',
    )
    await fireEvent.click(screen.getByRole('button', { name: i18n.global.t('payments.lookup.action') }))

    await waitFor(() => {
      expect(paymentService.getPaymentByReference).toHaveBeenCalledWith(
        'PAY-01JZXYZABCDEABCDEABCDEABC',
      )
    })

    expect(screen.getByText('PAY-01JZXYZABCDEABCDEABCDEABC')).toBeTruthy()
    expect(screen.getByText('ORD-01JZXYZABCDEABCDEABCDEABD')).toBeTruthy()
    expect(screen.getByText('ORD-01JZXYZABCDEABCDEABCDEABD').closest('a')?.getAttribute('href')).toBe(
      '/payments/by-order/order-001',
    )
    expect(screen.getByText('store-001')).toBeTruthy()
    expect(screen.getByText(/Attempt 2/)).toBeTruthy()
    expect(screen.getByText(/Attempt 1/)).toBeTruthy()
    expect(screen.getByText(/VNPAY-TRANSACTION-ID/)).toBeTruthy()
  })

  it('should search from route reference query', async () => {
    await renderPage('/payments?referenceNo=PAY-01JZXYZABCDEABCDEABCDEABC')

    await waitFor(() => {
      expect(paymentService.getPaymentByReference).toHaveBeenCalledWith(
        'PAY-01JZXYZABCDEABCDEABCDEABC',
      )
    })

    expect(
      (screen.getByLabelText(i18n.global.t('payments.lookup.label')) as HTMLInputElement).value,
    ).toBe('PAY-01JZXYZABCDEABCDEABCDEABC')
    expect(screen.getByText('ORD-01JZXYZABCDEABCDEABCDEABD')).toBeTruthy()
  })

  it('should render empty guidance before lookup', async () => {
    await renderPage()

    expect(screen.getByText(i18n.global.t('payments.lookup.empty'))).toBeTruthy()
  })

  it('should clear payment detail when leaving the page', async () => {
    const { unmount } = await renderPage('/payments?referenceNo=PAY-01JZXYZABCDEABCDEABCDEABC')
    const paymentStore = usePaymentStore()

    await waitFor(() => {
      expect(paymentStore.payment?.referenceNo).toBe('PAY-01JZXYZABCDEABCDEABCDEABC')
    })

    unmount()

    expect(paymentStore.payment).toBeNull()
  })
})

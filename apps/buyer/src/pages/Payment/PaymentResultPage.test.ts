import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { render, screen } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import PaymentResultPage from './PaymentResultPage.vue'
import { paymentService } from '@/services/payment.service'
import type { PaymentDetail } from '@/types'

const formatMoneyMock = jest.fn()

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')

  return {
    ...actual,
    useMoneyFormatter: () => ({
      formatMoney: formatMoneyMock,
    }),
  }
})

jest.mock('@/components/layout/StorefrontHeader.vue', () => ({
  default: { template: '<header data-testid="storefront-header" />' },
}))

jest.mock('@/services/payment.service', () => ({
  paymentService: {
    getPaymentDetail: jest.fn(),
    getPaymentByReference: jest.fn(),
    getPaymentByOrder: jest.fn(),
  },
}))

const renderPaymentResult = async (url: string) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/payment/result', component: PaymentResultPage },
      { path: '/checkout', component: { template: '<div />' } },
      { path: '/', component: { template: '<div />' } },
    ],
  })
  await router.push(url)
  await router.isReady()

  return render(PaymentResultPage, {
    global: {
      plugins: [pinia, router, i18n],
    },
  })
}

describe('PaymentResultPage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    formatMoneyMock.mockReset()
    formatMoneyMock.mockImplementation((value: unknown) => {
      const { amount } = value as {
        amount: number | null
      }

      return `${amount?.toLocaleString('vi-VN') ?? '0'}₫`
    })
    const payment: PaymentDetail = {
      id: 'payment-001',
      referenceNo: 'PAY-01JZXYZABCDEABCDEABCDEABC',
      linkedOrders: [{ orderId: 'order-001', orderCode: 'ORD-01JZXYZABCDEABCDEABCDEABD' }],
      buyerId: 'buyer-001',
      amount: { amount: 200_000, currencyCode: 'VND' },
      status: 'Succeeded',
      gateway: {
        code: 'VNPAY',
        gatewayTransactionId: 'gateway-001',
      },
      gatewayPaymentUrl: null,
      latestAttempt: {
        id: 'attempt-001',
        attemptNo: 1,
        methodCode: 'VNPAY',
        gatewayCode: 'VNPAY',
        status: 'Succeeded',
        redirectUrl: null,
        gatewayTransactionId: 'gateway-001',
        createdAt: '2026-06-12T00:00:00Z',
        completedAt: '2026-06-12T00:00:00Z',
      },
      paidAt: '2026-06-12T00:00:00Z',
      expiresAt: '2026-06-12T01:00:00Z',
      createdAt: '2026-06-12T00:00:00Z',
    }
    jest.mocked(paymentService.getPaymentByReference).mockResolvedValue(payment)
    jest.mocked(paymentService.getPaymentDetail).mockResolvedValue(payment)
    jest.mocked(paymentService.getPaymentByOrder).mockResolvedValue(payment)
  })

  afterEach(() => {
    jest.useRealTimers()
    sessionStorage.clear()
  })

  it('should render payment reference details when payment succeeds', async () => {
    await renderPaymentResult(
      '/payment/result?paymentReferenceNo=PAY-01JZXYZABCDEABCDEABCDEABC&status=Succeeded',
    )

    expect(await screen.findByText('PAY-01JZXYZABCDEABCDEABCDEABC')).toBeTruthy()
    expect(screen.getByText('gateway-001')).toBeTruthy()
    expect(paymentService.getPaymentByReference).toHaveBeenCalledWith(
      'PAY-01JZXYZABCDEABCDEABCDEABC',
    )
  })

  it('should render retry option when payment lookup fails', async () => {
    jest.mocked(paymentService.getPaymentByOrder).mockRejectedValue(new Error('not found'))

    await renderPaymentResult('/payment/result?orderId=order-001&status=Failed')

    const link = await screen.findByRole('link', { name: i18n.global.t('payment.tryAgain') })
    expect(link.getAttribute('href')).toBe('/checkout')
  })

  it('should render waiting state when payment remains pending', async () => {
    jest.useFakeTimers()
    jest.mocked(paymentService.getPaymentByOrder).mockResolvedValue({
      id: 'payment-001',
      orderId: 'order-001',
      buyerId: 'buyer-001',
      amount: { amount: 200_000, currencyCode: 'VND' },
      status: 'Pending',
      gateway: 'vnpay',
      gatewayTransactionId: null,
      gatewayPaymentUrl: null,
      paidAt: null,
      expiresAt: '2026-06-12T01:00:00Z',
      createdAt: '2026-06-12T00:00:00Z',
    })

    await renderPaymentResult('/payment/result?orderId=order-001&status=Pending')

    expect(await screen.findByText(i18n.global.t('payment.verifying'))).toBeTruthy()
    for (let index = 0; index < 20; index += 1) {
      await jest.advanceTimersByTimeAsync(2000)
    }
    expect(await screen.findByText(i18n.global.t('payment.pendingTitle'))).toBeTruthy()
  })

  it('should derive success from the route query when payment lookup fails after return', async () => {
    jest.mocked(paymentService.getPaymentByOrder).mockRejectedValue(new Error('gateway delay'))

    await renderPaymentResult('/payment/result?orderId=order-001&status=Succeeded')

    expect(await screen.findByText(i18n.global.t('payment.successTitle'))).toBeTruthy()
    expect(screen.getByText('order-001')).toBeTruthy()
  })

  it('should derive success from a lowercase gateway status when no lookup key is returned', async () => {
    await renderPaymentResult('/payment/result?status=success')

    expect(await screen.findByText(i18n.global.t('payment.successTitle'))).toBeTruthy()
  })

  it('should verify payment by pending session payment id when the callback omits lookup keys', async () => {
    sessionStorage.setItem('hivespace_pending_payment', JSON.stringify({
      paymentId: 'payment-001',
      orderIds: ['order-001'],
    }))

    await renderPaymentResult('/payment/result?status=success')

    expect(await screen.findByText(i18n.global.t('payment.successTitle'))).toBeTruthy()
    expect(paymentService.getPaymentDetail).toHaveBeenCalledWith('payment-001')
  })
})

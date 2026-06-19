import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { render, screen } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import PaymentResultPage from './PaymentResultPage.vue'
import { paymentService } from '@/services/payment.service'

jest.mock('@/components/layout/StorefrontHeader.vue', () => ({
  default: { template: '<header data-testid="storefront-header" />' },
}))

jest.mock('@/services/payment.service', () => ({
  paymentService: {
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

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render order confirmation details when payment succeeds', async () => {
    await renderPaymentResult('/payment/result?orderId=order-001&status=Succeeded')

    expect(await screen.findByText('order-001')).toBeTruthy()
    expect(screen.getByText('gateway-001')).toBeTruthy()
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
      paymentId: 'payment-001',
      orderId: 'order-001',
      buyerId: 'buyer-001',
      amount: 200_000,
      currency: 'VND',
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
})

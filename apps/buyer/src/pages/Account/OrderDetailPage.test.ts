import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { render, screen } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import OrderDetailPage from './OrderDetailPage.vue'
import { orderService } from '@/services/order.service'
import type { OrderDetail } from '@/types'

jest.mock('@/services/order.service', () => ({
  orderService: {
    getOrderById: jest.fn(),
  },
}))

const orderDetail: OrderDetail = {
  id: 'order-001',
  shortId: 'HS-001',
  userId: 'user-001',
  storeId: 'store-001',
  status: 'Confirmed',
  subTotal: 200_000,
  shippingFee: 0,
  totalAmount: 200_000,
  currency: 'VND',
  recipientName: 'Test Buyer',
  phone: '0900000000',
  streetAddress: '1 Test Street',
  commune: 'Ward 1',
  province: 'Ho Chi Minh City',
  country: 'VN',
  createdAt: '2026-06-12T00:00:00Z',
  confirmedAt: '2026-06-12T01:00:00Z',
  items: [
    {
      id: 'line-001',
      productId: 10,
      skuId: 100,
      productName: 'Honey Jar',
      skuName: 'Size M',
      imageUrl: '/honey.png',
      quantity: 2,
      unitPrice: 100_000,
      lineTotal: 200_000,
      currency: 'VND',
      isCOD: false,
    },
  ],
  paymentMethod: 'COD',
}

const renderOrderDetail = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/account/orders/:id', name: 'OrderDetail', component: OrderDetailPage },
      { path: '/orders', name: 'Orders', component: { template: '<div />' } },
      { path: '/profile', name: 'BuyerProfile', component: { template: '<div />' } },
      { path: '/profile/address', name: 'ProfileAddress', component: { template: '<div />' } },
      { path: '/notifications', name: 'Notifications', component: { template: '<div />' } },
    ],
  })
  await router.push('/account/orders/order-001')
  await router.isReady()

  render(OrderDetailPage, {
    global: {
      plugins: [pinia, router, i18n],
    },
  })
}

describe('OrderDetailPage', () => {
  beforeEach(() => {
    jest.mocked(orderService.getOrderById).mockResolvedValue(orderDetail)
  })

  it('should render order detail with line items status and address', async () => {
    await renderOrderDetail()

    expect(await screen.findByText('HS-001')).toBeTruthy()
    expect(screen.getByText('Honey Jar')).toBeTruthy()
    expect(screen.getByText('Test Buyer')).toBeTruthy()
    expect(screen.getByText('COD')).toBeTruthy()
  })

  it('should request the order by route id', async () => {
    await renderOrderDetail()

    expect(orderService.getOrderById).toHaveBeenCalledWith('order-001')
  })
})

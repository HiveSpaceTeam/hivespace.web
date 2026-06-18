import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import OrdersPage from './OrdersPage.vue'
import { orderService } from '@/services/order.service'
import type { GetOrdersResponse } from '@/types'

jest.mock('@/components/profile/ProfileSidebar.vue', () => ({
  default: { template: '<aside data-testid="profile-sidebar" />' },
}))

jest.mock('@/services/order.service', () => ({
  orderService: {
    getOrders: jest.fn(),
  },
}))

const ordersResponse = (orders: GetOrdersResponse['orders']): GetOrdersResponse => ({
  orders,
  pagination: {
    currentPage: 1,
    pageSize: 5,
    totalItems: orders.length,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
})

const order = {
  id: 'order-001',
  shortId: 'HS-001',
  status: 'Created' as const,
  totalAmount: 200_000,
  currency: 'VND',
  createdAt: '2026-06-12T00:00:00Z',
  itemCount: 1,
  items: [
    {
      id: 'item-001',
      productName: 'Honey Jar',
      productImage: '/honey.png',
      variation: 'Size: M',
      quantity: 2,
      originalPrice: 120_000,
      unitPrice: 100_000,
      lineTotal: 200_000,
      currency: 'VND',
    },
  ],
}

const renderOrders = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/orders', name: 'Orders', component: OrdersPage },
      { path: '/account/orders/:id', name: 'OrderDetail', component: { template: '<div />' } },
    ],
  })
  await router.push('/orders')
  await router.isReady()

  render(OrdersPage, {
    global: {
      plugins: [pinia, router, i18n],
    },
  })

  return router
}

describe('OrdersPage', () => {
  beforeEach(() => {
    jest.mocked(orderService.getOrders).mockResolvedValue(ordersResponse([order]))
  })

  it('should render buyer orders from the store-backed service', async () => {
    await renderOrders()

    expect(await screen.findByText('HS-001')).toBeTruthy()
    expect(screen.getByText('Honey Jar')).toBeTruthy()
  })

  it('should render an empty state when no buyer orders exist', async () => {
    jest.mocked(orderService.getOrders).mockResolvedValue(ordersResponse([]))

    await renderOrders()

    expect(await screen.findByText(i18n.global.t('storefront.ordersPage.emptyOrders'))).toBeTruthy()
  })

  it('should navigate to order detail when an order row is selected', async () => {
    const router = await renderOrders()

    await fireEvent.click(await screen.findByText('HS-001'))

    await waitFor(() => expect(router.currentRoute.value.path).toBe('/account/orders/order-001'))
  })
})

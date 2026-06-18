import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { orderService } from '@/services/order.service'
import type { CustomerOrderProcessStatus, GetOrdersResponse, OrderDetail } from '@/types'
import { useOrdersStore } from './orders.store'

jest.mock('@/services/order.service', () => ({
  orderService: {
    getOrders: jest.fn(),
    getOrderById: jest.fn(),
  },
}))

const ordersResponse: GetOrdersResponse = {
  orders: [
    {
      id: 'order-001',
      shortId: 'HS-001',
      status: 'Created',
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
    },
  ],
  pagination: {
    currentPage: 1,
    pageSize: 5,
    totalItems: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
}

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
}

describe('useOrdersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(orderService.getOrders).mockResolvedValue(ordersResponse)
    jest.mocked(orderService.getOrderById).mockResolvedValue(orderDetail)
  })

  it('should fetch buyer orders from the orders API', async () => {
    const store = useOrdersStore()

    await store.fetchOrders()

    expect(orderService.getOrders).toHaveBeenCalledWith({ page: 1, pageSize: 5 })
    expect(store.orders[0]?.shortId).toBe('HS-001')
  })

  it('should pass search filters to the orders API', async () => {
    jest.useFakeTimers()
    const store = useOrdersStore()

    store.setSearchQuery('HS-001')
    await jest.runAllTimersAsync()

    expect(orderService.getOrders).toHaveBeenCalledWith({
      page: 1,
      pageSize: 5,
      searchField: 'OrderCode',
      searchValue: 'HS-001',
    })
    jest.useRealTimers()
  })

  it('should fetch order detail with line items and status', async () => {
    const store = useOrdersStore()

    await store.fetchOrderById('order-001')

    expect(orderService.getOrderById).toHaveBeenCalledWith('order-001')
    expect(store.currentOrder?.status).toBe('Confirmed')
    expect(store.currentOrder?.items[0]?.productName).toBe('Honey Jar')
  })

  it('loadMore_WhenHasNextPage_AppendsOrders', async () => {
    const page2Response: GetOrdersResponse = {
      orders: [{ ...ordersResponse.orders[0]!, id: 'order-002', shortId: 'HS-002' }],
      pagination: { ...ordersResponse.pagination, currentPage: 2, hasNextPage: false },
    }
    jest.mocked(orderService.getOrders)
      .mockResolvedValueOnce({
        ...ordersResponse,
        pagination: { ...ordersResponse.pagination, hasNextPage: true },
      })
      .mockResolvedValueOnce(page2Response)
    const store = useOrdersStore()
    await store.fetchOrders()

    await store.loadMore()

    expect(orderService.getOrders).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 5 }),
    )
    expect(store.orders).toHaveLength(2)
    expect(store.hasNextPage).toBe(false)
  })

  it('loadMore_WhenNoNextPage_DoesNotFetch', async () => {
    const store = useOrdersStore()

    await store.loadMore()

    expect(orderService.getOrders).not.toHaveBeenCalled()
  })

  it('setTab_SwitchesTabAndFetchesOrders', async () => {
    const store = useOrdersStore()

    const tab: CustomerOrderProcessStatus = 'Processing'
    await store.setTab(tab)

    expect(store.activeTab).toBe('Processing')
    expect(orderService.getOrders).toHaveBeenCalledWith(
      expect.objectContaining({ processStatus: 'Processing', page: 1, pageSize: 5 }),
    )
  })

  it('setSearchQuery_TrimsQueryAndFetchesAfterDebounce', async () => {
    jest.useFakeTimers()
    const store = useOrdersStore()

    store.setSearchQuery('  HS-001  ')
    await jest.runAllTimersAsync()

    expect(orderService.getOrders).toHaveBeenCalledWith(
      expect.objectContaining({ searchField: 'OrderCode', searchValue: 'HS-001' }),
    )
    jest.useRealTimers()
  })

  it('fetchOrderById_WhenServiceThrows_DoesNotPropagateError', async () => {
    jest.mocked(orderService.getOrderById).mockRejectedValueOnce(new Error('Not found'))
    const store = useOrdersStore()

    await expect(store.fetchOrderById('order-999')).resolves.toBeUndefined()
    expect(store.currentOrder).toBeNull()
  })

  it('clearCurrentOrder_ResetsCurrentOrder', async () => {
    const store = useOrdersStore()
    await store.fetchOrderById('order-001')
    expect(store.currentOrder).not.toBeNull()

    store.clearCurrentOrder()

    expect(store.currentOrder).toBeNull()
  })
})

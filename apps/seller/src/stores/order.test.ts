import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { useOrderStore } from './order.store'
import { orderService } from '@/services/order.service'
import { OrderProcessStatus, OrderStatus } from '@/types'
import type { GetOrderListResponse } from '@/types'

const mockSetLoading = jest.fn()
const mockNotifySuccess = jest.fn()

jest.mock('@/services/order.service', () => ({
  orderService: {
    getOrders: jest.fn(),
    confirmOrder: jest.fn(),
    rejectOrder: jest.fn(),
  },
}))

jest.mock('@hivespace/shared', () => ({
  useAppStore: () => ({
    setLoading: mockSetLoading,
    notifySuccess: mockNotifySuccess,
  }),
}))

jest.mock('@/i18n', () => ({
  __esModule: true,
  default: {
    global: {
      t: (key: string) => key,
    },
  },
}))

const orderListResponse = (count = 1): GetOrderListResponse => ({
  orders: Array.from({ length: count }, (_, i) => ({
    id: `order-00${i + 1}`,
    orderCode: `HS-00${i + 1}`,
    buyerName: `Buyer ${i + 1}`,
    items: [
      {
        id: `item-00${i + 1}`,
        productName: `Product ${i + 1}`,
        productImageUrl: '/product.png',
        variation: null,
        quantity: 1,
        tag: null,
      },
    ],
    totalAmount: 100_000,
    paymentMethod: 'COD',
    status: OrderStatus.Paid,
    actionDateTime: '2026-06-13T00:00:00Z',
    createdAt: '2026-06-13T00:00:00Z',
  })),
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: count,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
})

describe('useOrderStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
    jest.mocked(orderService.getOrders).mockResolvedValue(orderListResponse())
    jest.mocked(orderService.confirmOrder).mockResolvedValue(undefined)
    jest.mocked(orderService.rejectOrder).mockResolvedValue(undefined)
  })

  it('should fetch orders with seller filters', async () => {
    const store = useOrderStore()

    await store.fetchOrders()

    expect(orderService.getOrders).toHaveBeenCalledWith(
      expect.objectContaining({
        processStatus: OrderProcessStatus.All,
        page: 1,
        pageSize: 10,
      }),
    )
    expect(store.orders).toHaveLength(1)
    expect(store.orders[0]?.orderCode).toBe('HS-001')
  })

  it('should apply filters by resetting page and refetching', async () => {
    const store = useOrderStore()
    store.page = 3
    store.searchField = 'customerName'
    store.searchValue = '  Buyer 1  '

    await store.applyFilters()

    expect(store.page).toBe(1)
    expect(orderService.getOrders).toHaveBeenCalledWith(
      expect.objectContaining({
        searchField: 'customerName',
        searchValue: 'Buyer 1',
      }),
    )
  })

  it('should reset filters back to the default search state', async () => {
    const store = useOrderStore()
    store.page = 3
    store.searchField = 'product'
    store.searchValue = 'Honey Jar'

    await store.resetFilters()

    expect(store.page).toBe(1)
    expect(store.searchField).toBe('orderCode')
    expect(store.searchValue).toBe('')
    expect(orderService.getOrders).toHaveBeenCalledWith(
      expect.objectContaining({
        searchField: undefined,
        searchValue: undefined,
      }),
    )
  })

  it('should set the active tab and fetch orders for the new status', async () => {
    const store = useOrderStore()

    await store.setTab(OrderProcessStatus.ReadyToShip)

    expect(store.activeTab).toBe(OrderProcessStatus.ReadyToShip)
    expect(store.page).toBe(1)
    expect(orderService.getOrders).toHaveBeenCalledWith(
      expect.objectContaining({
        processStatus: OrderProcessStatus.ReadyToShip,
      }),
    )
  })

  it('should confirm orders and refresh the list', async () => {
    jest.mocked(orderService.getOrders)
      .mockResolvedValueOnce(orderListResponse())
      .mockResolvedValueOnce({
        ...orderListResponse(),
        orders: [{ ...orderListResponse().orders[0]!, status: OrderStatus.Confirmed }],
      })

    const store = useOrderStore()
    await store.fetchOrders()
    jest.clearAllMocks()
    jest.mocked(orderService.getOrders).mockResolvedValue({
      ...orderListResponse(),
      orders: [{ ...orderListResponse().orders[0]!, status: OrderStatus.Confirmed }],
    })

    await store.confirmOrder('order-001')

    expect(orderService.confirmOrder).toHaveBeenCalledWith('order-001')
    expect(orderService.getOrders).toHaveBeenCalled()
    expect(mockNotifySuccess).toHaveBeenCalledWith(
      'order.notifications.confirmSuccess.title',
      'order.notifications.confirmSuccess.message',
    )
    expect(mockSetLoading).toHaveBeenNthCalledWith(1, true)
    expect(mockSetLoading).toHaveBeenLastCalledWith(false)
  })

  it('should cancel orders and refresh the list', async () => {
    jest.mocked(orderService.getOrders).mockResolvedValue(orderListResponse())
    const store = useOrderStore()
    await store.fetchOrders()
    jest.clearAllMocks()
    jest.mocked(orderService.getOrders).mockResolvedValue({
      ...orderListResponse(),
      orders: [{ ...orderListResponse().orders[0]!, status: OrderStatus.Rejected }],
    })

    await store.cancelOrder('order-001', 'Out of stock')

    expect(orderService.rejectOrder).toHaveBeenCalledWith('order-001', 'Out of stock')
    expect(orderService.getOrders).toHaveBeenCalled()
    expect(mockNotifySuccess).toHaveBeenCalledWith(
      'order.notifications.cancelSuccess.title',
      'order.notifications.cancelSuccess.message',
    )
    expect(mockSetLoading).toHaveBeenNthCalledWith(1, true)
    expect(mockSetLoading).toHaveBeenLastCalledWith(false)
  })
})

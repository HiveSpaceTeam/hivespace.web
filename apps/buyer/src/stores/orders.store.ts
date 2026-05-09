import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAppStore } from '@hivespace/shared'
import { orderService } from '@/services/order.service'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { Order, OrderDetail, CustomerOrderProcessStatus, GetOrdersQuery } from '@/types'

const PAGE_SIZE = 5

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])
  const activeTab = ref<CustomerOrderProcessStatus | 'all'>('all')
  const searchQuery = ref('')
  const { isLoading, run } = useAsyncAction()
  const { isLoading: isLoadingMore, run: runMore } = useAsyncAction()
  const hasNextPage = ref(false)
  const currentPage = ref(1)

  const currentOrder = ref<OrderDetail | null>(null)
  const { isLoading: isLoadingDetail, run: runDetail } = useAsyncAction()

  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

  const fetchOrders = async () => {
    currentPage.value = 1
    orders.value = []
    const trimmed = searchQuery.value.trim()
    const params: Partial<GetOrdersQuery> = {
      processStatus: activeTab.value === 'all' ? undefined : activeTab.value,
      page: 1,
      pageSize: PAGE_SIZE,
    }
    if (trimmed) {
      params.searchField = 'OrderCode'
      params.searchValue = trimmed
    }
    const result = await run(() => orderService.getOrders(params))
    orders.value = result.orders
    hasNextPage.value = result.pagination.hasNextPage
  }

  const loadMore = async () => {
    if (isLoadingMore.value || !hasNextPage.value) return
    const trimmed = searchQuery.value.trim()
    const nextPage = currentPage.value + 1
    const result = await runMore(() =>
      orderService.getOrders({
        processStatus: activeTab.value === 'all' ? undefined : activeTab.value,
        ...(trimmed ? { searchField: 'OrderCode', searchValue: trimmed } : {}),
        page: nextPage,
        pageSize: PAGE_SIZE,
      }),
    )
    orders.value = [...orders.value, ...result.orders]
    currentPage.value = nextPage
    hasNextPage.value = result.pagination.hasNextPage
  }

  const setTab = (tab: CustomerOrderProcessStatus | 'all') => {
    activeTab.value = tab
    fetchOrders()
  }

  const setSearchQuery = (q: string) => {
    searchQuery.value = q
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
    searchDebounceTimer = setTimeout(() => fetchOrders(), 400)
  }

  const fetchOrderById = async (orderId: string) => {
    await runDetail(async () => {
      currentOrder.value = await orderService.getOrderById(orderId)
    }).catch(() => {
      useAppStore().notifyError('orders.errors.notFound')
    })
  }

  const clearCurrentOrder = () => {
    currentOrder.value = null
  }

  return {
    orders,
    activeTab,
    searchQuery,
    isLoading,
    isLoadingMore,
    hasNextPage,
    fetchOrders,
    loadMore,
    setTab,
    setSearchQuery,
    currentOrder,
    isLoadingDetail,
    fetchOrderById,
    clearCurrentOrder,
  }
})

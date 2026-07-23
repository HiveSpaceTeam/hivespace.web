import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  normalizeCurrencyCode,
  normalizeMoneyDisplay,
  type CurrencyCodeInput,
  type MoneyIssue,
  type NormalizableMoney,
  useAppStore,
} from '@hivespace/shared'
import { orderService } from '@/services/order.service'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { Order, OrderDetail, CustomerOrderProcessStatus, GetOrdersQuery } from '@/types'

const resolveMoneyIssue = (currencyCode: CurrencyCodeInput): MoneyIssue | null =>
  normalizeCurrencyCode(currencyCode) ? null : { code: 'missing_currency' }

const normalizeOrder = (order: Order): Order => {
  const totalAmount = normalizeMoneyDisplay(order.totalAmount as NormalizableMoney, {
    currencyCode: order.currencyCode ?? order.currency,
  })
  const currencyCode = totalAmount.currencyCode ?? normalizeCurrencyCode(order.currencyCode ?? order.currency)

  return {
    ...order,
    totalAmount: totalAmount.amount ?? 0,
    currency: order.currency ?? currencyCode,
    currencyCode,
    moneyIssue: totalAmount.issue ?? order.moneyIssue ?? resolveMoneyIssue(currencyCode),
    items: order.items.map((item) => {
      const unitPrice = normalizeMoneyDisplay(item.unitPrice as NormalizableMoney, {
        currencyCode: item.currencyCode ?? item.currency ?? currencyCode,
      })
      const originalPrice = normalizeMoneyDisplay(item.originalPrice as NormalizableMoney, {
        currencyCode: item.currencyCode ?? item.currency ?? unitPrice.currencyCode ?? currencyCode,
      })
      const lineTotal = normalizeMoneyDisplay(item.lineTotal as NormalizableMoney, {
        currencyCode: item.currencyCode ?? item.currency ?? unitPrice.currencyCode ?? currencyCode,
      })
      const itemCurrencyCode = unitPrice.currencyCode
        ?? lineTotal.currencyCode
        ?? normalizeCurrencyCode(item.currencyCode ?? item.currency ?? currencyCode)

      return {
        ...item,
        originalPrice: originalPrice.amount ?? 0,
        unitPrice: unitPrice.amount ?? 0,
        lineTotal: lineTotal.amount ?? 0,
        currency: item.currency ?? itemCurrencyCode,
        currencyCode: itemCurrencyCode,
        moneyIssue: unitPrice.issue ?? lineTotal.issue ?? item.moneyIssue ?? resolveMoneyIssue(itemCurrencyCode),
      }
    }),
  }
}

const normalizeOrderDetail = (order: OrderDetail): OrderDetail => {
  const totalAmount = normalizeMoneyDisplay(order.totalAmount as NormalizableMoney, {
    currencyCode: order.currencyCode ?? order.currency,
  })
  const subTotal = normalizeMoneyDisplay(order.subTotal as NormalizableMoney, {
    currencyCode: order.currencyCode ?? order.currency ?? totalAmount.currencyCode,
  })
  const shippingFee = normalizeMoneyDisplay(order.shippingFee as NormalizableMoney, {
    currencyCode: order.currencyCode ?? order.currency ?? totalAmount.currencyCode,
  })
  const currencyCode = totalAmount.currencyCode
    ?? subTotal.currencyCode
    ?? normalizeCurrencyCode(order.currencyCode ?? order.currency)

  return {
    ...order,
    subTotal: subTotal.amount ?? 0,
    shippingFee: shippingFee.amount ?? 0,
    totalAmount: totalAmount.amount ?? 0,
    currency: order.currency ?? currencyCode,
    currencyCode,
    moneyIssue: totalAmount.issue ?? subTotal.issue ?? order.moneyIssue ?? resolveMoneyIssue(currencyCode),
    items: order.items.map((item) => {
      const unitPrice = normalizeMoneyDisplay(item.unitPrice as NormalizableMoney, {
        currencyCode: item.currencyCode ?? item.currency ?? currencyCode,
      })
      const lineTotal = normalizeMoneyDisplay(item.lineTotal as NormalizableMoney, {
        currencyCode: item.currencyCode ?? item.currency ?? unitPrice.currencyCode ?? currencyCode,
      })
      const itemCurrencyCode = unitPrice.currencyCode
        ?? lineTotal.currencyCode
        ?? normalizeCurrencyCode(item.currencyCode ?? item.currency ?? currencyCode)

      return {
        ...item,
        unitPrice: unitPrice.amount ?? 0,
        lineTotal: lineTotal.amount ?? 0,
        currency: item.currency ?? itemCurrencyCode,
        currencyCode: itemCurrencyCode,
        moneyIssue: unitPrice.issue ?? lineTotal.issue ?? item.moneyIssue ?? resolveMoneyIssue(itemCurrencyCode),
      }
    }),
  }
}

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
    orders.value = result.orders.map(normalizeOrder)
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
    orders.value = [...orders.value, ...result.orders.map(normalizeOrder)]
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
      currentOrder.value = normalizeOrderDetail(await orderService.getOrderById(orderId))
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

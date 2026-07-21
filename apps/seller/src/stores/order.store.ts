import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import i18n from '@/i18n'
import { useAppStore } from '@hivespace/shared'
import type { PaymentMethodMetadata, PaymentMethodCode } from '@hivespace/shared'
import { OrderProcessStatus } from '@/types'
import type { Order } from '@/types'
import { orderService } from '@/services/order.service'
import { paymentService } from '@/services/payment.service'

const sortMethods = (methods: PaymentMethodMetadata[]) =>
  [...methods].sort((left, right) => left.sortOrder - right.sortOrder)

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const paymentMethods = ref<PaymentMethodMetadata[]>([])
  const totalOrders = ref(0)
  const isFetching = ref(false)

  const activeTab = ref<OrderProcessStatus>(OrderProcessStatus.All)
  const searchField = ref<'orderCode' | 'customerName' | 'product'>('orderCode')
  const searchValue = ref('')
  const page = ref(1)
  const pageSize = ref(10)

  const totalPages = computed(() => Math.max(1, Math.ceil(totalOrders.value / pageSize.value)))

  const paymentMethodLabelMap = computed(() =>
    paymentMethods.value.reduce<Record<string, string>>((labels, method) => {
      labels[String(method.code).toUpperCase()] = method.displayName
      return labels
    }, {}),
  )

  const resolvePaymentMethodLabel = (
    methodCode?: PaymentMethodCode | null,
    fallback?: string | null,
  ) => {
    const code = methodCode ? String(methodCode).toUpperCase() : ''
    return (code ? paymentMethodLabelMap.value[code] : undefined) ?? fallback ?? ''
  }

  const mapOrderPaymentLabel = (order: Order): Order => ({
    ...order,
    paymentMethodLabel: resolvePaymentMethodLabel(order.paymentMethodCode, order.paymentMethod),
  })

  const fetchPaymentMethods = async () => {
    const response = await paymentService.getPaymentMethods()
    paymentMethods.value = sortMethods(response.methods)
    return paymentMethods.value
  }

  const fetchOrders = async () => {
    isFetching.value = true
    try {
      const trimmedSearchValue = searchValue.value.trim()
      const hasSearch = trimmedSearchValue.length > 0
      const result = await orderService.getOrders({
        processStatus: activeTab.value,
        searchField: hasSearch ? searchField.value : undefined,
        searchValue: hasSearch ? trimmedSearchValue : undefined,
        page: page.value,
        pageSize: pageSize.value,
      })

      orders.value = result.orders.map(mapOrderPaymentLabel)
      totalOrders.value = result.pagination.totalItems

      try {
        await fetchPaymentMethods()
        orders.value = result.orders.map(mapOrderPaymentLabel)
      } catch {
        paymentMethods.value = []
      }
    } finally {
      isFetching.value = false
    }
  }

  const applyFilters = async () => {
    page.value = 1
    await fetchOrders()
  }

  const resetFilters = async () => {
    searchValue.value = ''
    searchField.value = 'orderCode'
    page.value = 1
    await fetchOrders()
  }

  const setTab = async (tab: OrderProcessStatus) => {
    activeTab.value = tab
    page.value = 1
    await fetchOrders()
  }

  const confirmOrder = async (orderId: string) => {
    const appStore = useAppStore()
    try {
      appStore.setLoading(true)
      await orderService.confirmOrder(orderId)
      appStore.notifySuccess(
        i18n.global.t('order.notifications.confirmSuccess.title'),
        i18n.global.t('order.notifications.confirmSuccess.message'),
      )
      await fetchOrders()
    } finally {
      appStore.setLoading(false)
    }
  }

  const cancelOrder = async (orderId: string, reason: string) => {
    const appStore = useAppStore()
    try {
      appStore.setLoading(true)
      await orderService.rejectOrder(orderId, reason)
      appStore.notifySuccess(
        i18n.global.t('order.notifications.cancelSuccess.title'),
        i18n.global.t('order.notifications.cancelSuccess.message'),
      )
      await fetchOrders()
    } finally {
      appStore.setLoading(false)
    }
  }

  return {
    orders,
    paymentMethods,
    totalOrders,
    isFetching,
    activeTab,
    searchField,
    searchValue,
    page,
    pageSize,
    totalPages,
    fetchPaymentMethods,
    resolvePaymentMethodLabel,
    fetchOrders,
    applyFilters,
    resetFilters,
    setTab,
    confirmOrder,
    cancelOrder,
  }
})

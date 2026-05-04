<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="$t('order.title')" />

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ $t('order.breadcrumb') }}
        </h1>
      </div>

      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
        <div class="border-b border-gray-200 dark:border-gray-700 px-2 pt-1">
          <Tabs v-model="activeTabValue" :options="tabOptions" />
        </div>

        <div class="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex min-w-[320px] items-center gap-2">
              <div class="min-w-[160px]">
                <Select v-model="searchField" :options="searchFieldOptions" />
              </div>
              <input
                v-model="searchValue"
                type="text"
                :placeholder="searchPlaceholder"
                class="flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 h-11"
                @keyup.enter="handleApply"
              />
            </div>

            <div class="flex items-center gap-2">
              <Button variant="primary" size="sm" @click="handleApply">
                {{ $t('order.search.apply') }}
              </Button>
              <Button variant="outline" size="sm" @click="handleReset">
                {{ $t('order.search.reset') }}
              </Button>
            </div>
          </div>
        </div>

        <div v-if="orderStore.isFetching" class="p-12 text-center">
          <Spinner />
        </div>

        <template v-else>
          <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('order.itemCount', { count: orderStore.totalOrders }) }}
            </span>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1 text-sm text-gray-500">
                <ArrowDownRedIcon class="h-4 w-4" />
                <span>{{ $t('order.sort.label') }}</span>
              </div>
              <Button
                v-if="activeTab === OrderProcessStatus.ReadyToShip || activeTab === OrderProcessStatus.All"
                variant="primary"
                size="sm"
                :startIcon="ListIcon"
              >
                {{ $t('order.actions.bulkShip') }}
              </Button>
            </div>
          </div>

          <div class="overflow-x-auto custom-scrollbar">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  <th class="w-[420px] px-4 py-3 text-left">
                    <p class="font-medium text-gray-500 text-theme-xs">
                      {{ $t('order.table.product') }}
                    </p>
                  </th>
                  <th class="w-[160px] px-4 py-3 text-right">
                    <p class="font-medium text-gray-500 text-theme-xs">
                      {{ $t('order.table.totalAmount') }}
                    </p>
                  </th>
                  <th class="w-[130px] px-4 py-3 text-left">
                    <p class="font-medium text-gray-500 text-theme-xs">
                      {{ $t('order.table.status') }}
                    </p>
                  </th>
                  <th class="w-[180px] px-4 py-3 text-left">
                    <p class="flex items-center gap-1 font-medium text-gray-500 text-theme-xs">
                      {{ $t('order.table.countdown') }}
                      <span
                        class="inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-400 text-[10px] text-gray-400 cursor-help"
                      >?</span>
                    </p>
                  </th>
                  <th class="w-[140px] px-4 py-3 text-left">
                    <p class="font-medium text-gray-500 text-theme-xs">
                      {{ $t('order.table.actions') }}
                    </p>
                  </th>
                </tr>
              </thead>

              <tbody v-if="orderStore.orders.length === 0">
                <tr>
                  <td colspan="5" class="px-4 py-16 text-center text-gray-500">
                    <p class="text-sm font-medium">{{ $t('order.table.emptyText') }}</p>
                  </td>
                </tr>
              </tbody>

              <tbody
                v-for="order in orderStore.orders"
                :key="order.id"
                class="border-b border-gray-200 dark:border-gray-700"
              >
                <tr class="bg-gray-50/70 dark:bg-gray-800/30">
                  <td colspan="5" class="px-4 py-2">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <Avatar :name="order.buyerName" size="small" />
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {{ order.buyerName }}
                        </span>
                        <MailIcon class="h-4 w-4 text-gray-400" />
                      </div>
                      <span class="text-sm text-gray-500">
                        {{ $t('order.orderCode') }} {{ order.orderCode }}
                      </span>
                    </div>
                  </td>
                </tr>

                <tr v-if="order.items.length > 0" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                  <td class="px-4 py-3">
                    <ProductCell :item="order.items[0]" />
                  </td>
                  <td :rowspan="order.items.length" class="px-4 py-3 align-top text-right">
                    <p class="whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      đ{{ formatMoney(order.totalAmount) }}
                    </p>
                    <p class="mt-0.5 text-xs text-gray-500">{{ order.paymentMethod }}</p>
                  </td>
                  <td :rowspan="order.items.length" class="px-4 py-3 align-top">
                    <p class="text-sm text-gray-700 dark:text-gray-300">{{ getStatusLabel(order.status) }}</p>
                  </td>
                  <td
                    :rowspan="order.items.length"
                    class="max-w-[180px] px-4 py-3 align-top text-xs text-gray-500 dark:text-gray-400"
                  >
                    {{ formatActionDateTime(order.actionDateTime) }}
                  </td>
                  <td :rowspan="order.items.length" class="px-4 py-3 align-top">
                    <div v-if="canConfirmOrder(order.status)" class="flex flex-col gap-2">
                      <Button variant="primary" size="sm" @click="handleConfirm(order.id)">
                        {{ $t('order.actions.confirm') }}
                      </Button>
                      <Button variant="outline" size="sm" @click="handleCancel(order.id)">
                        {{ $t('order.actions.cancel') }}
                      </Button>
                    </div>
                    <button
                      v-else-if="canPrepareOrder(order.status)"
                      class="text-sm font-medium text-brand-500 hover:underline"
                      @click="handlePrepare(order.id)"
                    >
                      {{ $t('order.actions.prepareGoods') }}
                    </button>
                    <button v-else class="text-sm text-brand-500 hover:underline">
                      {{ $t('order.actions.viewDetail') }}
                    </button>
                  </td>
                </tr>

                <tr
                  v-for="item in order.items.slice(1)"
                  :key="item.id"
                  class="hover:bg-gray-50/50 dark:hover:bg-gray-800/20"
                >
                  <td class="border-t border-gray-100 px-4 py-3 dark:border-gray-800">
                    <ProductCell :item="item" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="orderStore.totalOrders > orderStore.pageSize"
            class="border-t border-gray-200 px-4 py-4 dark:border-gray-700"
          >
            <Pagination
              :currentPage="orderStore.page"
              :totalPages="orderStore.totalPages"
              :pageSize="orderStore.pageSize"
              :totalItems="orderStore.totalOrders"
              @update:currentPage="handlePageChange"
              @update:pageSize="handlePageSizeChange"
            />
          </div>
        </template>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { AppShell } from '@hivespace/shared'
import {
  PageBreadcrumb,
  Button,
  Tabs,
  Select,
  Pagination,
  Avatar,
  Spinner,
  useFormatDate,
} from '@hivespace/shared'
import { ArrowDownRedIcon, ListIcon, MailIcon } from '@hivespace/shared'
import { OrderProcessStatus, OrderStatus } from '@/types'
import { useOrderStore } from '@/stores/order.store'
import { useConfirmModal } from '@hivespace/shared'
import ProductCell from './components/ProductCell.vue'

const { t } = useI18n()
const orderStore = useOrderStore()
const { confirm, deleteConfirm } = useConfirmModal()
const { formatDateTime } = useFormatDate()

const activeTab = computed({
  get: () => orderStore.activeTab,
  set: (val) => orderStore.setTab(val),
})

const activeTabValue = computed({
  get: () => String(orderStore.activeTab),
  set: (val: string) => orderStore.setTab(Number(val) as OrderProcessStatus),
})

const searchField = computed({
  get: () => orderStore.searchField,
  set: (val) => (orderStore.searchField = val),
})

const searchValue = computed({
  get: () => orderStore.searchValue,
  set: (val) => (orderStore.searchValue = val),
})

const tabOptions = computed(() => [
  { label: t('order.tabs.all'), value: String(OrderProcessStatus.All) },
  { label: t('order.tabs.pendingConfirmation'), value: String(OrderProcessStatus.PendingConfirmation) },
  { label: t('order.tabs.readyToShip'), value: String(OrderProcessStatus.ReadyToShip) },
  { label: t('order.tabs.shipping'), value: String(OrderProcessStatus.Shipping) },
  { label: t('order.tabs.delivered'), value: String(OrderProcessStatus.Delivered) },
  { label: t('order.tabs.returnCancel'), value: String(OrderProcessStatus.ReturnCancel) },
])

const searchFieldOptions = computed(() => [
  { label: t('order.search.fieldOrderCode'), value: 'orderCode' },
  { label: t('order.search.fieldCustomerName'), value: 'customerName' },
  { label: t('order.search.fieldProduct'), value: 'product' },
])

const searchPlaceholder = computed(() => {
  const found = searchFieldOptions.value.find((option) => option.value === searchField.value)
  return found ? t('order.search.placeholder', { field: found.label }) : ''
})

const orderStatusLabelKeys: Record<OrderStatus, string> = {
  [OrderStatus.Created]: 'order.status.created',
  [OrderStatus.Paid]: 'order.status.paid',
  [OrderStatus.COD]: 'order.status.cod',
  [OrderStatus.Confirmed]: 'order.status.confirmed',
  [OrderStatus.Rejected]: 'order.status.rejected',
  [OrderStatus.Shipped]: 'order.status.shipped',
  [OrderStatus.Delivered]: 'order.status.delivered',
  [OrderStatus.Completed]: 'order.status.completed',
  [OrderStatus.Cancelled]: 'order.status.cancelled',
  [OrderStatus.Claimed]: 'order.status.claimed',
  [OrderStatus.Refunding]: 'order.status.refunding',
  [OrderStatus.Refunded]: 'order.status.refunded',
  [OrderStatus.Solved]: 'order.status.solved',
  [OrderStatus.Expired]: 'order.status.expired',
  [OrderStatus.ReadyToShip]: 'order.status.readyToShip',
}

const handleApply = () => {
  orderStore.applyFilters()
}

const handleReset = () => {
  orderStore.resetFilters()
}

const handlePageChange = (newPage: number) => {
  orderStore.page = newPage
  orderStore.fetchOrders()
}

const handlePageSizeChange = (size: number) => {
  orderStore.pageSize = size
  orderStore.page = 1
  orderStore.fetchOrders()
}

const handleConfirm = async (orderId: string) => {
  const confirmed = await confirm(
    t('order.actions.confirm'),
    t('order.notifications.confirmSuccess.message'),
  )
  if (confirmed) {
    await orderStore.confirmOrder(orderId)
  }
}

const handleCancel = async (orderId: string) => {
  const confirmed = await deleteConfirm(
    t('order.actions.cancel'),
    t('order.notifications.cancelConfirm.message'),
  )
  if (confirmed) {
    await orderStore.cancelOrder(orderId, t('order.notifications.cancelConfirm.defaultReason'))
  }
}

const handlePrepare = (orderId: string) => {
  console.log('Prepare goods for order:', orderId)
}

const getStatusLabel = (status: OrderStatus) => {
  return t(orderStatusLabelKeys[status])
}

const canConfirmOrder = (status: OrderStatus) => {
  return status === OrderStatus.Paid || status === OrderStatus.COD
}

const canPrepareOrder = (status: OrderStatus) => {
  return status === OrderStatus.Confirmed || status === OrderStatus.ReadyToShip
}

const formatMoney = (amount: number) => amount.toLocaleString('vi-VN')

const formatActionDateTime = (value: string) => {
  return formatDateTime(value)
}

onMounted(() => {
  orderStore.fetchOrders()
})
</script>

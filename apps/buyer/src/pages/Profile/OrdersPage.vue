<template>
  <div class="min-h-screen bg-[#f5f5f5] dark:bg-surface-dark py-6">
    <div class="container mx-auto px-4">
      <div class="flex gap-4 items-start">

        <ProfileSidebar />

        <!-- Main content -->
        <div class="flex-1 min-w-0">

          <!-- Tab bar -->
          <div class="bg-white dark:bg-card-dark rounded shadow-sm mb-3 overflow-x-auto">
            <div class="flex border-b border-gray-100 dark:border-gray-700 min-w-max">
              <button
                v-for="tab in tabs"
                :key="tab.value"
                @click="ordersStore.setTab(tab.value)"
                class="px-5 py-4 text-sm whitespace-nowrap transition-colors border-b-2 -mb-px"
                :class="activeTab === tab.value
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-primary'"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <!-- Search bar -->
          <div class="bg-white dark:bg-card-dark rounded shadow-sm mb-3 px-4 py-3">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                :value="searchQuery"
                @input="ordersStore.setSearchQuery(($event.target as HTMLInputElement).value)"
                :placeholder="$t('storefront.ordersPage.searchPlaceholder')"
                class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-transparent text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <!-- Loading (initial) -->
          <div v-if="isLoading" class="flex justify-center py-16">
            <Spinner />
          </div>

          <!-- Empty state -->
          <div
            v-else-if="orders.length === 0"
            class="bg-white dark:bg-card-dark rounded shadow-sm py-16 flex flex-col items-center text-gray-400 gap-3"
          >
            <ShoppingBag class="w-16 h-16 opacity-30" />
            <p class="text-sm">{{ $t('storefront.ordersPage.emptyOrders') }}</p>
          </div>

          <!-- Order cards -->
          <div v-else class="flex flex-col gap-3">
            <div
              v-for="order in orders"
              :key="order.id"
              class="bg-white dark:bg-card-dark rounded shadow-sm overflow-hidden cursor-pointer"
              @click="router.push(`/account/orders/${order.id}`)"
            >
              <!-- Order header -->
              <div class="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                <ShoppingBag class="w-4 h-4 shrink-0 text-gray-400" />
                <span class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ order.shortId }}</span>
                <span class="text-xs text-gray-400">·</span>
                <span class="text-xs text-gray-400">
                  {{ $t('storefront.ordersPage.itemCount', { count: order.itemCount }) }}
                </span>

                <!-- Status badge -->
                <div class="ml-auto">
                  <span
                    v-if="statusConfig[order.status]"
                    class="text-xs font-semibold uppercase tracking-wide"
                    :class="statusConfig[order.status].color"
                  >
                    {{ $t(`storefront.ordersPage.${statusConfig[order.status].key}`) }}
                  </span>
                  <span v-else class="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {{ order.status }}
                  </span>
                </div>
              </div>

              <!-- Product items -->
              <div class="px-5 py-3 flex flex-col gap-4">
                <div
                  v-for="item in order.items"
                  :key="item.id"
                  class="flex items-start gap-3"
                >
                  <img
                    :src="item.productImage"
                    :alt="item.productName"
                    class="w-20 h-20 object-cover rounded border border-gray-100 dark:border-gray-700 shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-800 dark:text-gray-100 line-clamp-2">{{ item.productName }}</p>
                    <p v-if="item.variation" class="text-xs text-gray-400 mt-1">{{ item.variation }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ $t('storefront.ordersPage.qty', { qty: item.quantity }) }}</p>
                  </div>
                  <div class="text-right shrink-0">
                    <p v-if="item.originalPrice && item.originalPrice !== item.unitPrice"
                      class="text-xs text-gray-400 line-through">
                      {{ formatPrice(item.originalPrice) }}
                    </p>
                    <p class="text-sm text-gray-800 dark:text-gray-100">{{ formatPrice(item.unitPrice) }}</p>
                  </div>
                </div>
              </div>

              <!-- Total row -->
              <div class="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-end items-center gap-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('storefront.ordersPage.total') }}</span>
                <span class="text-base font-semibold text-primary">{{ formatPrice(order.totalAmount) }}</span>
              </div>

              <!-- Action buttons -->
              <div class="px-5 pb-4 flex items-center justify-end" @click.stop>
                <div class="flex items-center gap-2">
                  <template v-if="deliveredStatuses.includes(order.status)">
                    <Button variant="primary" size="sm" @click="() => {}">
                      {{ $t('storefront.ordersPage.btnReview') }}
                    </Button>
                    <Button variant="outline" size="sm" @click="() => {}">
                      {{ $t('storefront.ordersPage.btnRequestReturn') }}
                    </Button>
                    <Button variant="outline" size="sm" @click="() => {}">
                      {{ $t('storefront.ordersPage.btnMore') }}
                    </Button>
                  </template>
                  <template v-else-if="cancelledStatuses.includes(order.status)">
                    <Button variant="primary" size="sm" @click="() => {}">
                      {{ $t('storefront.ordersPage.btnBuyAgain') }}
                    </Button>
                    <Button variant="outline" size="sm" @click="() => {}">
                      {{ $t('storefront.ordersPage.btnContactSeller') }}
                    </Button>
                  </template>
                  <template v-else-if="refundStatuses.includes(order.status)">
                    <Button variant="outline" size="sm" @click="() => {}">
                      {{ $t('storefront.ordersPage.btnViewRefundInfo') }}
                    </Button>
                    <Button variant="outline" size="sm" @click="() => {}">
                      {{ $t('storefront.ordersPage.btnContactSeller') }}
                    </Button>
                  </template>
                  <template v-else>
                    <Button variant="outline" size="sm" @click="() => {}">
                      {{ $t('storefront.ordersPage.btnContactSeller') }}
                    </Button>
                    <Button variant="outline" size="sm" @click="() => {}">
                      {{ $t('storefront.ordersPage.btnMore') }}
                    </Button>
                  </template>
                </div>
              </div>
            </div>

            <!-- Infinite scroll sentinel -->
            <div ref="sentinel" class="h-1" />

            <!-- Load more spinner -->
            <div v-if="isLoadingMore" class="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Spinner } from '@hivespace/shared'
import { storeToRefs } from 'pinia'
import { ShoppingBag, Search } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useOrdersStore } from '@/stores'
import ProfileSidebar from '@/components/profile/ProfileSidebar.vue'
import type { CustomerOrderProcessStatus, OrderStatus } from '@/types'

const router = useRouter()
const { t } = useI18n()
const ordersStore = useOrdersStore()
const { orders, activeTab, searchQuery, isLoading, isLoadingMore, hasNextPage } = storeToRefs(ordersStore)

const sentinel = ref<HTMLDivElement | null>(null)

const tabs = computed<{ value: CustomerOrderProcessStatus | 'all'; label: string }[]>(() => [
  { value: 'all',            label: t('storefront.ordersPage.tabAll') },
  { value: 'WaitingPayment', label: t('storefront.ordersPage.tabWaitingPayment') },
  { value: 'Processing',     label: t('storefront.ordersPage.tabProcessing') },
  { value: 'Shipping',       label: t('storefront.ordersPage.tabShipping') },
  { value: 'Delivered',      label: t('storefront.ordersPage.tabDelivered') },
  { value: 'Cancelled',      label: t('storefront.ordersPage.tabCancelled') },
  { value: 'ReturnRefund',   label: t('storefront.ordersPage.tabReturnRefund') },
])

const statusConfig: Record<OrderStatus, { color: string; key: string }> = {
  Created:     { color: 'text-orange-500', key: 'statusCreated' },
  Paid:        { color: 'text-green-500',  key: 'statusPaid' },
  COD:         { color: 'text-green-500',  key: 'statusCOD' },
  Confirmed:   { color: 'text-green-600',  key: 'statusConfirmed' },
  ReadyToShip: { color: 'text-blue-400',   key: 'statusReadyToShip' },
  Shipped:     { color: 'text-blue-500',   key: 'statusShipped' },
  Delivered:   { color: 'text-primary',    key: 'statusDelivered' },
  Completed:   { color: 'text-primary',    key: 'statusCompleted' },
  Cancelled:   { color: 'text-gray-400',   key: 'statusCancelled' },
  Rejected:    { color: 'text-red-500',    key: 'statusRejected' },
  Expired:     { color: 'text-gray-400',   key: 'statusExpired' },
  Refunding:   { color: 'text-red-400',    key: 'statusRefunding' },
  Refunded:    { color: 'text-red-500',    key: 'statusRefunded' },
  Solved:      { color: 'text-gray-500',   key: 'statusSolved' },
  Claimed:     { color: 'text-yellow-600', key: 'statusClaimed' },
}

const deliveredStatuses: OrderStatus[] = ['Delivered', 'Completed']
const cancelledStatuses: OrderStatus[] = ['Cancelled', 'Rejected', 'Expired']
const refundStatuses: OrderStatus[] = ['Refunding', 'Refunded', 'Solved', 'Claimed']

const formatPrice = (price: number) =>
  price.toLocaleString('vi-VN') + 'đ'

let observer: IntersectionObserver | null = null

onMounted(() => {
  ordersStore.fetchOrders()

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasNextPage.value) {
        ordersStore.loadMore()
      }
    },
    { threshold: 0.1 },
  )
})

watch(sentinel, (el) => {
  if (el && observer) observer.observe(el)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

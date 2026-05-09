<template>
  <div class="min-h-screen bg-[#f5f5f5] dark:bg-surface-dark py-6">
    <div class="container mx-auto px-4">
      <div class="flex gap-4 items-start">

        <!-- Sidebar -->
        <aside class="w-52 shrink-0">
          <div class="bg-white dark:bg-card-dark rounded shadow-sm overflow-hidden">
            <div class="flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-700">
              <Avatar size="medium" />
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {{ displayUsername }}
                </p>
                <RouterLink to="/profile"
                  class="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors mt-0.5">
                  <Pencil class="w-3 h-3" />
                  {{ $t('storefront.profilePage.editProfile') }}
                </RouterLink>
              </div>
            </div>
            <nav class="py-2">
              <RouterLink to="/notifications"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Bell class="w-4 h-4 shrink-0" />
                {{ $t('storefront.profilePage.navNotifications') }}
              </RouterLink>

              <div>
                <button @click="accountOpen = !accountOpen"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <User class="w-4 h-4 shrink-0 text-primary" />
                  <span class="flex-1 text-left">{{ $t('storefront.profilePage.navMyAccount') }}</span>
                  <ChevronDown class="w-3.5 h-3.5 transition-transform" :class="accountOpen ? 'rotate-180' : ''" />
                </button>
                <div v-show="accountOpen" class="pl-11 pr-3 pb-1 flex flex-col gap-0.5">
                  <RouterLink to="/profile"
                    class="block px-3 py-1.5 text-sm rounded transition-colors text-gray-500 dark:text-gray-400 hover:text-primary">
                    {{ $t('storefront.profilePage.navProfile') }}
                  </RouterLink>
                  <RouterLink to="/profile/address"
                    class="block px-3 py-1.5 text-sm rounded transition-colors text-gray-500 dark:text-gray-400 hover:text-primary">
                    {{ $t('storefront.profilePage.navAddress') }}
                  </RouterLink>
                  <RouterLink to="/profile/change-password"
                    class="block px-3 py-1.5 text-sm rounded transition-colors text-gray-500 dark:text-gray-400 hover:text-primary">
                    {{ $t('storefront.profilePage.navChangePassword') }}
                  </RouterLink>
                </div>
              </div>

              <RouterLink to="/orders"
                class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary">
                <ShoppingBag class="w-4 h-4 shrink-0 text-primary" />
                {{ $t('storefront.profilePage.navMyOrders') }}
              </RouterLink>
            </nav>
          </div>
        </aside>

        <!-- Main content -->
        <div class="flex-1 min-w-0">

          <!-- Loading -->
          <div v-if="isLoadingDetail" class="flex justify-center py-24">
            <Spinner size="lg" />
          </div>

          <!-- Error state -->
          <div v-else-if="!currentOrder" class="bg-white dark:bg-card-dark rounded shadow-sm py-20 flex flex-col items-center gap-4">
            <ShoppingBag class="w-16 h-16 text-gray-200 dark:text-gray-700" />
            <p class="text-sm text-gray-500">{{ $t('orders.errors.notFound') }}</p>
            <RouterLink to="/orders"
              class="text-sm text-primary hover:underline">
              {{ $t('orders.detail.back') }}
            </RouterLink>
          </div>

          <template v-else>
            <!-- Header -->
            <div class="bg-white dark:bg-card-dark rounded shadow-sm px-5 py-4 mb-3 flex items-center gap-4">
              <RouterLink to="/orders" class="text-gray-400 hover:text-primary transition-colors">
                <ChevronLeft class="w-5 h-5" />
              </RouterLink>
              <div class="flex-1 min-w-0">
                <span class="text-xs text-gray-400">{{ $t('orders.detail.orderCode') }}</span>
                <span class="ml-2 text-sm font-semibold text-gray-800 dark:text-gray-100">{{ currentOrder.shortId }}</span>
              </div>
              <span
                class="text-xs font-semibold uppercase tracking-wide"
                :class="statusColor(currentOrder.status)"
              >
                {{ statusLabel(currentOrder.status) }}
              </span>
            </div>

            <!-- Timeline -->
            <div class="bg-white dark:bg-card-dark rounded shadow-sm px-6 py-5 mb-3">
              <OrderTimeline :steps="timelineSteps" />
            </div>

            <!-- Delivery address -->
            <div class="bg-white dark:bg-card-dark rounded shadow-sm px-5 py-4 mb-3">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                {{ $t('orders.detail.deliveryAddress') }}
              </h3>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ currentOrder.recipientName }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ currentOrder.phone }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {{ currentOrder.streetAddress }}, {{ currentOrder.commune }},
                {{ currentOrder.province }}, {{ currentOrder.country }}
              </p>
              <p v-if="currentOrder.notes" class="text-xs text-gray-400 mt-1 italic">{{ currentOrder.notes }}</p>
            </div>

            <!-- Items + price summary -->
            <div class="bg-white dark:bg-card-dark rounded shadow-sm px-5 py-4 mb-3">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
                {{ $t('orders.detail.items') }}
              </h3>

              <!-- Item list -->
              <div class="flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
                <div
                  v-for="item in currentOrder.items"
                  :key="item.id"
                  class="flex items-start gap-3 py-3 first:pt-0"
                >
                  <img
                    :src="item.imageUrl"
                    :alt="item.productName"
                    class="w-20 h-20 object-cover rounded border border-gray-100 dark:border-gray-700 shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-800 dark:text-gray-100 line-clamp-2">{{ item.productName }}</p>
                    <p v-if="item.skuName" class="text-xs text-gray-400 mt-1">{{ item.skuName }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">
                      {{ $t('storefront.ordersPage.qty', { qty: item.quantity }) }}
                    </p>
                  </div>
                  <div class="text-right shrink-0">
                    <p class="text-sm font-medium text-primary">{{ formatPrice(item.lineTotal) }}</p>
                    <p v-if="item.unitPrice * item.quantity !== item.lineTotal"
                      class="text-xs text-gray-400 line-through mt-0.5">
                      {{ formatPrice(item.unitPrice * item.quantity) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Price breakdown -->
              <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">{{ $t('orders.detail.subTotal') }}</span>
                  <span class="text-gray-800 dark:text-gray-100">{{ formatPrice(currentOrder.subTotal) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">{{ $t('orders.detail.shippingFee') }}</span>
                  <span class="text-gray-800 dark:text-gray-100">
                    {{ currentOrder.shippingFee === 0 ? $t('orders.detail.free') : formatPrice(currentOrder.shippingFee) }}
                  </span>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ $t('orders.detail.total') }}</span>
                  <span class="text-base font-bold text-primary">{{ formatPrice(currentOrder.totalAmount) }}</span>
                </div>
              </div>
            </div>

            <!-- Payment method -->
            <div v-if="currentOrder.paymentMethod" class="bg-white dark:bg-card-dark rounded shadow-sm px-5 py-4">
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500 dark:text-gray-400">{{ $t('orders.detail.paymentMethod') }}</span>
                <span class="font-medium text-gray-800 dark:text-gray-100">{{ currentOrder.paymentMethod }}</span>
              </div>
            </div>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useAuth, Avatar, Spinner, OrderTimeline } from '@hivespace/shared'
import type { TimelineStep } from '@hivespace/shared'
import { Bell, ShoppingBag, Pencil, ChevronLeft, User, ChevronDown } from 'lucide-vue-next'
import { useOrdersStore } from '@/stores'
import type { OrderDetail, OrderStatus } from '@/types'

const route = useRoute()
const { t } = useI18n()
const { currentUser } = useAuth()
const ordersStore = useOrdersStore()
const { currentOrder, isLoadingDetail } = storeToRefs(ordersStore)

const accountOpen = ref(false)

const displayUsername = computed(() =>
  currentUser.value?.profile?.preferred_username
  ?? currentUser.value?.profile?.name
  ?? currentUser.value?.profile?.sub
  ?? ''
)

onMounted(() => ordersStore.fetchOrderById(route.params.id as string))
onUnmounted(() => ordersStore.clearCurrentOrder())

const formatPrice = (amount: number) => amount.toLocaleString('vi-VN') + 'đ'

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  Completed:   'text-primary',
  Delivered:   'text-primary',
  Shipped:     'text-blue-500',
  ReadyToShip: 'text-blue-400',
  Confirmed:   'text-green-600',
  Paid:        'text-green-500',
  COD:         'text-green-500',
  Created:     'text-orange-500',
  Cancelled:   'text-gray-400',
  Rejected:    'text-red-500',
  Expired:     'text-gray-400',
  Refunding:   'text-red-400',
  Refunded:    'text-red-500',
}

const statusColor = (status: string) => STATUS_COLOR[status] ?? 'text-gray-400'

const statusLabel = (status: string) =>
  t(`orders.detail.status.${status}`, status)

// ── Timeline ─────────────────────────────────────────────────────────────────

const DELIVERED_STATUSES: OrderStatus[] = ['Delivered', 'Completed']
const SHIPPED_STATUSES:   OrderStatus[] = ['Shipped', 'Delivered', 'Completed']
const CONFIRMED_STATUSES: OrderStatus[] = ['Confirmed', 'ReadyToShip', 'Shipped', 'Delivered', 'Completed']
const PAID_STATUSES:      OrderStatus[] = ['Paid', 'COD', 'Confirmed', 'ReadyToShip', 'Shipped', 'Delivered', 'Completed']

const buildTimelineSteps = (order: OrderDetail): TimelineStep[] => {
  const s = order.status as OrderStatus
  return [
    {
      key: 'placed',
      label: t('orders.detail.timeline.placed'),
      timestamp: order.createdAt,
      isCompleted: true,
      isCurrent: s === 'Created',
    },
    {
      key: 'paid',
      label: t('orders.detail.timeline.paid'),
      timestamp: order.paidAt ?? null,
      isCompleted: PAID_STATUSES.includes(s),
      isCurrent: s === 'Paid' || s === 'COD',
    },
    {
      key: 'confirmed',
      label: t('orders.detail.timeline.confirmed'),
      timestamp: order.confirmedAt ?? null,
      isCompleted: CONFIRMED_STATUSES.includes(s),
      isCurrent: s === 'Confirmed' || s === 'ReadyToShip',
    },
    {
      key: 'shipping',
      label: t('orders.detail.timeline.shipping'),
      timestamp: null,
      isCompleted: SHIPPED_STATUSES.includes(s),
      isCurrent: s === 'Shipped',
    },
    {
      key: 'delivered',
      label: t('orders.detail.timeline.delivered'),
      timestamp: null,
      isCompleted: DELIVERED_STATUSES.includes(s),
      isCurrent: DELIVERED_STATUSES.includes(s),
    },
  ]
}

const timelineSteps = computed<TimelineStep[]>(() =>
  currentOrder.value ? buildTimelineSteps(currentOrder.value) : []
)
</script>

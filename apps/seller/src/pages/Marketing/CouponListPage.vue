<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="$t('coupon.title')" />
    <div class="space-y-5 sm:space-y-6">


      <!-- Gateway Cards -->
      <ComponentCard :title="$t('coupon.creationGateway.title')">
        <p class="text-sm text-gray-500 mb-4">{{ $t('coupon.creationGateway.description') }}</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Shop Coupon -->
          <div
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col justify-between hover:border-brand-500 transition-colors">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-brand-500 w-5 h-5">
                  <BoxIcon />
                </span>
                <h3 class="font-bold text-gray-900 dark:text-white">{{ $t('coupon.creationGateway.shopCoupon.title') }}
                </h3>
              </div>
              <p class="text-sm text-gray-500 mb-4">{{ $t('coupon.creationGateway.shopCoupon.description') }}</p>
            </div>
            <div class="flex justify-end mt-4">
              <Button variant="outline" size="sm"
                @click="$router.push(`/marketing/coupons/create?type=${CouponType.ENTIRE_SHOP}`)">{{
                  $t('coupon.creationGateway.shopCoupon.button') }}</Button>
            </div>
          </div>

          <!-- Product Coupon -->
          <div
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col justify-between hover:border-brand-500 transition-colors">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-brand-500 w-5 h-5">
                  <GridIcon />
                </span>
                <h3 class="font-bold text-gray-900 dark:text-white">{{ $t('coupon.creationGateway.productCoupon.title')
                  }}</h3>
              </div>
              <p class="text-sm text-gray-500 mb-4">{{ $t('coupon.creationGateway.productCoupon.description') }}</p>
            </div>
            <div class="flex justify-end mt-4">
              <Button variant="outline" size="sm"
                @click="$router.push(`/marketing/coupons/create?type=${CouponType.SPECIFIC_PRODUCTS}`)">{{
                  $t('coupon.creationGateway.productCoupon.button') }}</Button>
            </div>
          </div>

          <!-- Private Coupon -->
          <div
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col justify-between hover:border-brand-500 transition-colors">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-brand-500 w-5 h-5">
                  <LockIcon />
                </span>
                <h3 class="font-bold text-gray-900 dark:text-white">{{ $t('coupon.creationGateway.privateCoupon.title')
                  }}
                </h3>
              </div>
              <p class="text-sm text-gray-500 mb-4">{{ $t('coupon.creationGateway.privateCoupon.description') }}</p>
            </div>
            <div class="flex justify-end mt-4">
              <Button variant="outline" size="sm"
                @click="$router.push(`/marketing/coupons/create?type=${CouponType.PRIVATE}`)">{{
                  $t('coupon.creationGateway.privateCoupon.button') }}</Button>
            </div>
          </div>
        </div>
      </ComponentCard>

      <!-- Coupon List Table -->
      <ComponentCard :title="$t('coupon.list.title')">
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">

          <!-- Tabs -->
          <div class="border-b border-gray-200 dark:border-gray-700 p-2">
            <Tabs v-model="activeTab" :options="tabs" />
          </div>

          <!-- Search & Filter Controls -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex flex-col sm:flex-row gap-4 items-center">
              <div class="w-full sm:w-64">
                <Input type="text" v-model="searchQuery" :placeholder="$t('coupon.list.searchPlaceholder')" />
              </div>
              <Button class="shrink-0" @click="handleSearch">{{ $t('coupon.list.searchButton') }}</Button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="appStore.isLoading || couponStore.isFetching" class="p-8 text-center">
            <Spinner />
            <p class="mt-2 text-gray-600 dark:text-gray-400">{{ $t('coupon.list.loading') }}</p>
          </div>

          <!-- Table -->
          <div v-else class="max-w-full overflow-x-auto custom-scrollbar" style="min-height: 200px">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th class="px-5 py-3 text-left w-3/16 sm:px-6 whitespace-nowrap">
                    <p class="font-medium text-gray-500 text-theme-xs">{{ $t('coupon.list.table.nameAndCode') }}</p>
                  </th>
                  <th class="px-5 py-3 text-left w-1/8 sm:px-6 whitespace-nowrap">
                    <p class="font-medium text-gray-500 text-theme-xs">{{ $t('coupon.list.table.type') }}</p>
                  </th>
                  <th class="px-5 py-3 text-left w-1/8 sm:px-6 whitespace-nowrap">
                    <p class="font-medium text-gray-500 text-theme-xs">{{ $t('coupon.list.table.applicableProducts') }}
                    </p>
                  </th>
                  <th class="px-5 py-3 text-left w-1/8 sm:px-6 whitespace-nowrap">
                    <p class="font-medium text-gray-500 text-theme-xs">{{ $t('coupon.list.table.discount') }}</p>
                  </th>
                  <th class="px-5 py-3 text-center w-1/16 sm:px-3 whitespace-nowrap">
                    <p class="font-medium text-gray-500 text-theme-xs">{{ $t('coupon.list.table.usage') }}</p>
                  </th>
                  <th class="px-5 py-3 text-center w-1/8 sm:px-3 whitespace-nowrap">
                    <p class="font-medium text-gray-500 text-theme-xs">{{ $t('coupon.list.table.usageQuantity') }}</p>
                  </th>
                  <th class="px-5 py-3 text-left w-3/16 sm:px-6 whitespace-nowrap">
                    <p class="font-medium text-gray-500 text-theme-xs">{{ $t('coupon.list.table.duration') }}</p>
                  </th>
                  <th class="px-5 py-3 text-center w-1/16 sm:px-6 whitespace-nowrap">
                    <p class="font-medium text-gray-500 text-theme-xs">{{ $t('coupon.list.table.actions') }}</p>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-if="coupons.length === 0">
                  <td colspan="8" class="px-5 py-12 text-center text-gray-500 dark:text-gray-400">
                    <p class="text-sm font-medium">{{ $t('coupon.list.table.emptyText') }}</p>
                  </td>
                </tr>
                <tr v-for="coupon in coupons" :key="coupon.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center gap-3">
                      <!-- Icon -->
                      <div class="flex shrink-0 items-center justify-center w-12 h-12 rounded shadow-sm"
                        :class="coupon.discountType === DiscountType.Percentage ? 'bg-[#ff7a2b]' : 'bg-linear-to-br from-[#66dbd8] to-[#4096ff]'">
                        <!-- Percentage icon -->
                        <PercentageIcon v-if="coupon.discountType === DiscountType.Percentage" class="text-white" />
                        <!-- Fixed amount icon -->
                        <FixedAmountIcon v-else class="text-white" />
                      </div>

                      <!-- Details -->
                      <div class="flex flex-col items-start gap-0.5">
                        <Badge size="sm" :color="getCouponStatusBadge(coupon).color">
                          {{ getCouponStatusBadge(coupon).label }}
                        </Badge>
                        <span class="text-sm font-medium text-gray-900 dark:text-white leading-tight mt-0.5">{{
                          coupon.name }}</span>
                        <span class="text-xs text-gray-500 leading-tight">{{ $t('coupon.list.codePrefix') }}{{
                          coupon.code }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-4 sm:px-6">
                    <Badge size="sm" :color="getCouponTypeBadge(coupon).color">
                      {{ getCouponTypeBadge(coupon).label }}
                    </Badge>
                  </td>
                  <td class="px-5 py-4 sm:px-6">
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      {{ coupon.applicableProductIds.length > 0
                        ? $t('coupon.list.productCount', { count: coupon.applicableProductIds.length })
                        : $t('coupon.list.allProducts') }}
                    </span>
                  </td>
                  <td class="px-5 py-4 sm:px-6">
                    <div class="flex flex-col">
                      <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatDiscount(coupon)
                        }}</span>
                      <span v-if="coupon.minOrderAmount > 0" class="text-xs text-gray-500">{{ $t('coupon.list.minSpend')
                      }} {{
                          formatMoney(coupon.minOrderAmount, coupon.discountCurrency) }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-4 sm:px-6 text-center">
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      {{ coupon.currentUsageCount }}
                    </span>
                  </td>
                  <td class="px-5 py-4 sm:px-6 text-center">
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      {{ coupon.maxUsageCount === 0 ? '∞' : coupon.maxUsageCount }}
                    </span>
                  </td>
                  <td class="px-5 py-4 sm:px-6">
                    <span class="text-sm text-[#0050b3] dark:text-blue-400 whitespace-nowrap">
                      {{ formatDateTime(coupon.startDateTime) }} - {{ formatDateTime(coupon.endDateTime) }}
                    </span>
                  </td>
                  <td class="px-5 py-4 sm:px-6 text-center">
                    <DropdownMenu>
                      <template #icon>
                        <HorizontalDots />
                      </template>
                      <template #menu>
                        <!-- View / Edit Details -->
                        <button @click="$router.push(`/marketing/coupons/detail/${coupon.id}`)"
                          class="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-0 active:outline-none dark:text-gray-300 dark:hover:bg-gray-700">
                          <EyeIcon v-if="coupon.status == CouponStatus.Expired" class="mr-2 w-4 h-4" />
                          <EditIcon v-else class="mr-2 w-4 h-4" />
                          <span class="pl-2">
                            {{ coupon.status !== CouponStatus.Expired ? $t('coupon.actions.edit') :
                              $t('coupon.actions.view') }}
                          </span>
                        </button>

                        <!-- End (Upcoming) -->
                        <button v-if="coupon.status === CouponStatus.Ongoing" @click="handleEndCoupon(coupon)"
                          class="flex items-center w-full px-3 py-2 text-sm text-orange-600 hover:bg-gray-50 focus:outline-none focus:ring-0 active:outline-none dark:text-orange-400 dark:hover:bg-gray-600">
                          <CloseIcon class="mr-2 w-4 h-4" />
                          <span class="pl-2">{{ $t('coupon.actions.end') }}</span>
                        </button>

                        <!-- Duplicate -->
                        <button @click="$router.push(`/marketing/coupons/create?copyId=${coupon.id}`)"
                          class="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-0 active:outline-none dark:text-gray-300 dark:hover:bg-gray-700">
                          <CopyIcon class="mr-2 w-4 h-4" />
                          <span class="pl-2">{{ $t('coupon.actions.duplicate') }}</span>

                        </button>

                        <!-- Delete (Upcoming) -->
                        <button v-if="coupon.status === CouponStatus.Upcoming" @click="handleDeleteCoupon(coupon)"
                          class="flex items-center w-full px-3 py-2 text-sm text-red-700 hover:bg-gray-50 focus:outline-none focus:ring-0 active:outline-none dark:text-red-400 dark:hover:bg-gray-600">
                          <TrashRedIcon class="mr-2 w-4 h-4" />
                          <span class="pl-2">{{ $t('coupon.actions.delete') }}</span>
                        </button>
                      </template>
                    </DropdownMenu>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="couponStore.pagination && couponStore.pagination.totalPages > 1"
            class="p-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination :currentPage="page" :totalPages="couponStore.pagination.totalPages" :pageSize="pageSize"
              :totalItems="couponStore.pagination.totalItems" @update:currentPage="handlePageChange" />
          </div>
        </div>
      </ComponentCard>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  AppShell,
  PageBreadcrumb,
  ComponentCard,
  Button,
  Input,
  Tabs,
  useFormatDate,
  Badge,
  DropdownMenu,
  useConfirmModal,
  useAppStore,
  Pagination,
  Spinner,
} from '@hivespace/shared'
import {
  BoxIcon,
  CloseIcon,
  CopyIcon,
  EditIcon,
  EyeIcon,
  FixedAmountIcon,
  GridIcon,
  HorizontalDots,
  LockIcon,
  PercentageIcon,
  TrashRedIcon,
} from '@hivespace/shared'
import { CouponType, CouponStatus, DiscountType } from '@/types'
import type { CouponSummaryDto } from '@/types'
import { useCouponStore } from '@/stores/coupon.store'

const { t } = useI18n()
const couponStore = useCouponStore()
const appStore = useAppStore()
const { formatDateTime } = useFormatDate()
const { deleteConfirm, confirm } = useConfirmModal()

const tabs = computed(() => [
  { label: t('coupon.list.tabs.all'), value: String(CouponStatus.All) },
  { label: t('coupon.list.tabs.ongoing'), value: String(CouponStatus.Ongoing) },
  { label: t('coupon.list.tabs.upcoming'), value: String(CouponStatus.Upcoming) },
  { label: t('coupon.list.tabs.expired'), value: String(CouponStatus.Expired) },
])


const activeTab = computed({
  get: () => couponStore.activeTab,
  set: (val) => couponStore.activeTab = val
})
const searchQuery = ref('')
const coupons = computed(() => couponStore.coupons)

// Helper functions
const formatMoney = (amount: number, currency: string | null | undefined) => {
  const symbol = currency === 'VND' ? '₫' : (currency === 'USD' ? '$' : (currency || ''));
  return `${symbol}${amount.toLocaleString()}`;
}

const formatDiscount = (coupon: CouponSummaryDto) => {
  if (coupon.discountType === DiscountType.FixedAmount) {
    return formatMoney(coupon.discountAmount || 0, coupon.discountCurrency);
  } else {
    let result = `${coupon.discountPercentage}${t('coupon.list.discountOff')}`;
    if (coupon.maxDiscountAmount) {
      result += ` (${t('coupon.list.discountMax')} ${formatMoney(coupon.maxDiscountAmount, coupon.discountCurrency)})`;
    }
    return result;
  }
}


const getCouponTypeBadge = (coupon: CouponSummaryDto) => {
  if (coupon.isHidden) return { label: t('coupon.creationGateway.privateCoupon.title'), color: 'warning' as const };
  if (coupon.applicableProductIds && coupon.applicableProductIds.length > 0) return { label: t('coupon.creationGateway.productCoupon.title'), color: 'info' as const };
  return { label: t('coupon.creationGateway.shopCoupon.title'), color: 'primary' as const };
}

const getCouponStatusBadge = (coupon: CouponSummaryDto) => {
  switch (coupon.status) {
    case CouponStatus.Expired: return { label: t('coupon.list.tabs.expired'), color: 'light' as const };
    case CouponStatus.Upcoming: return { label: t('coupon.list.tabs.upcoming'), color: 'info' as const };
    case CouponStatus.Ongoing: return { label: t('coupon.list.tabs.ongoing'), color: 'success' as const };
    default: return { label: t('coupon.list.tabs.all'), color: 'light' as const };
  }
}

// Pagination state
const page = ref(1)
const pageSize = ref(5)

const fetchCoupons = async () => {
  await couponStore.fetchCoupons({
    couponStatus: Number(activeTab.value) as CouponStatus,
    page: page.value,
    pageSize: pageSize.value,
    couponName: searchQuery.value, // Optional text search mapping
  })
}

const handleSearch = () => {
  page.value = 1
  fetchCoupons()
}

const handlePageChange = (newPage: number) => {
  page.value = newPage
  fetchCoupons()
}

// Action Handlers
const handleEndCoupon = async (coupon: CouponSummaryDto) => {
  const confirmed = await confirm(
    t('coupon.actions.end'),
    t('coupon.notifications.endConfirm', { name: coupon.name })
  )
  if (confirmed) {
    try {
      await couponStore.endCoupon(coupon.id)
      await fetchCoupons()
    } catch {
      // Error is handled by store notification
    }
  }
}

const handleDeleteCoupon = async (coupon: CouponSummaryDto) => {
  const confirmed = await deleteConfirm(
    t('coupon.actions.delete'),
    t('coupon.notifications.deleteConfirm', { name: coupon.name })
  )
  if (confirmed) {
    try {
      await couponStore.deleteCoupon(coupon.id)
      await fetchCoupons()
    } catch {
      // Error is handled by store notification
    }
  }
}

// Watchers
watch(activeTab, () => {
  page.value = 1 // Reset page on tab change
  couponStore.clearCoupons() // Clear stale list before re-fetching
  fetchCoupons()
})

onMounted(() => {
  fetchCoupons()
})
</script>

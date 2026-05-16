<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="t('buyers.title')">
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ t('buyers.description') }}
      </p>
    </PageBreadcrumb>

    <div class="mt-4 mb-4 flex flex-wrap items-center justify-end gap-2">
      <Button variant="outline" size="sm" className="gap-2" @click="handleExport">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {{ t('buyers.actions.export') }}
      </Button>
    </div>

    <div class="space-y-5 pb-6">
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <div v-for="card in statCards" :key="card.label"
          class="relative rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="text-sm text-gray-500 dark:text-gray-400">{{ card.label }}</div>
          <div class="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{{ card.value }}</div>
          <div class="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span v-if="card.delta" :class="card.deltaClass">{{ card.delta }}</span>
            <span :class="card.subClass">{{ card.sub }}</span>
          </div>
          <div :class="[
            'absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full',
            card.iconBg,
          ]">
            <span :class="card.iconColor" v-html="card.icon"></span>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="flex flex-col gap-4 border-b border-gray-200 p-4 dark:border-gray-800 xl:flex-row xl:items-center">
          <Input v-model="searchQuery" type="search" :placeholder="t('buyers.filters.searchPlaceholder')"
            inputClass="border-gray-200 pl-11 dark:border-gray-700" class="w-full xl:min-w-[320px] xl:flex-1">
            <template #prepend>
              <svg
                class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </template>
          </Input>

          <Tabs v-model="statusFilter" :options="statusFilters" variant="pills" class="shrink-0 xl:w-auto xl:ml-auto" />

        </div>

        <div
          class="flex items-center justify-between border-b border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <div>{{ t('buyers.filters.displayingAll') }}</div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr
                class="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-400">
                <th class="px-5 py-3">{{ t('buyers.table.buyer') }}</th>
                <th class="px-5 py-3">{{ t('buyers.table.status') }}</th>
                <th class="px-5 py-3">{{ t('buyers.table.orders') }}</th>
                <th class="px-5 py-3">{{ t('buyers.table.totalSpend') }}</th>
                <th class="px-5 py-3">{{ t('buyers.table.lastActive') }}</th>
                <th class="px-5 py-3">{{ t('buyers.table.joinDate') }}</th>
                <th class="px-5 py-3 text-right">{{ t('buyers.table.actions') }}</th>
              </tr>
            </thead>
            <tbody v-if="pagedBuyers.length">
              <tr v-for="buyer in pagedBuyers" :key="buyer.id"
                class="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <span
                      class="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                      :style="{ background: buyer.avatarColor }">
                      {{ buyer.initials }}
                    </span>
                    <div class="min-w-0">
                      <div class="truncate font-medium text-gray-900 dark:text-white">{{ buyer.name }}</div>
                      <div class="truncate text-sm text-gray-500 dark:text-gray-400">{{ buyer.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <Badge size="sm" :color="STATUS_STYLES[buyer.status].badgeColor" dot
                    :dotColorClass="STATUS_STYLES[buyer.status].dotClass">
                    {{ buyer.status }}
                  </Badge>
                </td>
                <td class="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{{ formatInteger(buyer.orders) }}</td>
                <td class="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatCurrency(buyer.totalSpend) }}
                </td>
                <td class="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{{ buyer.lastActive }}</td>
                <td class="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{{ formatJoinDate(buyer.joinDate) }}</td>
                <td class="px-5 py-4">
                  <div class="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="whitespace-nowrap" @click="handleInspect(buyer)">
                      {{ t('buyers.actions.inspect') }}
                    </Button>
                    <Button v-if="buyer.status === 'Suspended'" variant="outline" size="sm"
                      className="whitespace-nowrap" @click="handleReinstate(buyer)">
                      {{ t('buyers.actions.reinstate') }}
                    </Button>
                    <Button v-else variant="outline" size="sm" className="whitespace-nowrap"
                      @click="handleSuspend(buyer)">
                      {{ t('buyers.actions.suspend') }}
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="7" class="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  {{ t('buyers.filters.noResults') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="border-t border-gray-200 px-5 py-4 dark:border-gray-800">
          <Pagination :currentPage="currentPage" :totalPages="totalPages" :pageSize="pageSize"
            :totalItems="filteredBuyers.length" @pageChange="currentPage = $event"
            @pageSizeChange="handlePageSizeChange">
            <template #summary>
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ t('buyers.table.showing', { count: pagedBuyers.length, total: filteredBuyers.length }) }}
              </div>
            </template>
          </Pagination>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  AppShell,
  Badge,
  Button,
  Input,
  PageBreadcrumb,
  Pagination,
  Tabs,
  useAppStore,
  useConfirmModal,
} from '@hivespace/shared'

const { t } = useI18n()

type BuyerStatus = 'Active' | 'Unverified' | 'Suspended' | 'Dormant'
type BuyerBadgeColor = 'success' | 'warning' | 'error' | 'light'

interface BuyerRow {
  id: string
  buyerCode: string
  name: string
  email: string
  initials: string
  avatarColor: string
  location: string
  status: BuyerStatus
  orders: number
  totalSpend: number
  lastActive: string
  joinDate: string
}

const appStore = useAppStore()
const { openConfirmModal } = useConfirmModal()

const STATUS_STYLES: Record<BuyerStatus, { badgeColor: BuyerBadgeColor; dotClass: string }> = {
  Active: { badgeColor: 'success', dotClass: 'bg-success-500' },
  Unverified: { badgeColor: 'warning', dotClass: 'bg-warning-500' },
  Suspended: { badgeColor: 'error', dotClass: 'bg-error-500' },
  Dormant: { badgeColor: 'light', dotClass: 'bg-gray-400' },
}

const BASE_TOTAL_BUYERS = 842184
const BASE_ACTIVE_BUYERS = 612877
const BASE_SUSPENDED_BUYERS = 90
const BASE_NEW_TODAY = 212
const AVG_LTV = 1200000
const TODAY = '2026-05-10'

const buyers = ref<BuyerRow[]>([
  {
    id: 'buyer-1',
    buyerCode: 'BU-842184',
    name: 'Linh Nguyen',
    email: 'linh.nguyen@hivespace.vn',
    initials: 'LN',
    avatarColor: '#8b5cf6',
    location: 'Ho Chi Minh City',
    status: 'Active',
    orders: 48,
    totalSpend: 18450000,
    lastActive: '5m ago',
    joinDate: '2023-08-14',
  },
  {
    id: 'buyer-2',
    buyerCode: 'BU-842185',
    name: 'An Tran',
    email: 'an.tran@shopmail.vn',
    initials: 'AT',
    avatarColor: '#0ea5e9',
    location: 'Ha Noi',
    status: 'Unverified',
    orders: 2,
    totalSpend: 580000,
    lastActive: '2h ago',
    joinDate: '2026-05-09',
  },
  {
    id: 'buyer-3',
    buyerCode: 'BU-842186',
    name: 'Bao Pham',
    email: 'bao.pham@buyer.co',
    initials: 'BP',
    avatarColor: '#f97316',
    location: 'Da Nang',
    status: 'Dormant',
    orders: 11,
    totalSpend: 4250000,
    lastActive: '29d ago',
    joinDate: '2024-02-03',
  },
  {
    id: 'buyer-4',
    buyerCode: 'BU-842187',
    name: 'Trang Le',
    email: 'trang.le@northstar.vn',
    initials: 'TL',
    avatarColor: '#10b981',
    location: 'Can Tho',
    status: 'Active',
    orders: 73,
    totalSpend: 26750000,
    lastActive: '14m ago',
    joinDate: '2022-11-26',
  },
  {
    id: 'buyer-5',
    buyerCode: 'BU-842188',
    name: 'Minh Vu',
    email: 'minh.vu@citymail.vn',
    initials: 'MV',
    avatarColor: '#ef4444',
    location: 'Hai Phong',
    status: 'Suspended',
    orders: 19,
    totalSpend: 6910000,
    lastActive: '3d ago',
    joinDate: '2023-12-09',
  },
  {
    id: 'buyer-6',
    buyerCode: 'BU-842189',
    name: 'Quynh Do',
    email: 'quynh.do@lotus.vn',
    initials: 'QD',
    avatarColor: '#465fff',
    location: 'Nha Trang',
    status: 'Active',
    orders: 32,
    totalSpend: 12990000,
    lastActive: '31m ago',
    joinDate: '2024-07-18',
  },
  {
    id: 'buyer-7',
    buyerCode: 'BU-842190',
    name: 'Huy Bui',
    email: 'huy.bui@beta.io',
    initials: 'HB',
    avatarColor: '#14b8a6',
    location: 'Bien Hoa',
    status: 'Dormant',
    orders: 7,
    totalSpend: 2130000,
    lastActive: '41d ago',
    joinDate: '2023-05-30',
  },
  {
    id: 'buyer-8',
    buyerCode: 'BU-842191',
    name: 'Gia Han',
    email: 'gia.han@market.vn',
    initials: 'GH',
    avatarColor: '#7c3aed',
    location: 'Ho Chi Minh City',
    status: 'Active',
    orders: 28,
    totalSpend: 9400000,
    lastActive: '9m ago',
    joinDate: TODAY,
  },
  {
    id: 'buyer-9',
    buyerCode: 'BU-842192',
    name: 'Phuc Ho',
    email: 'phuc.ho@shop.vn',
    initials: 'PH',
    avatarColor: '#f59e0b',
    location: 'Ha Noi',
    status: 'Unverified',
    orders: 1,
    totalSpend: 145000,
    lastActive: '6h ago',
    joinDate: '2026-05-08',
  },
  {
    id: 'buyer-10',
    buyerCode: 'BU-842193',
    name: 'Yen Vo',
    email: 'yen.vo@pearl.vn',
    initials: 'YV',
    avatarColor: '#ec4899',
    location: 'Vung Tau',
    status: 'Suspended',
    orders: 15,
    totalSpend: 5020000,
    lastActive: '8d ago',
    joinDate: '2024-09-04',
  },
])

const statusFilters = computed<Array<{ value: 'all' | BuyerStatus; label: string }>>(() => [
  { value: 'all', label: t('buyers.filters.all') },
  { value: 'Active', label: t('buyers.filters.active') },
  { value: 'Unverified', label: t('buyers.filters.unverified') },
  { value: 'Suspended', label: t('buyers.filters.suspended') },
  { value: 'Dormant', label: t('buyers.filters.dormant') },
])

const searchQuery = ref('')
const statusFilter = ref<'all' | BuyerStatus>('all')
const currentPage = ref(1)
const pageSize = ref(10)

const integerFormatter = new Intl.NumberFormat('en-US')
const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})
const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
})

const totalBuyersCount = computed(() => BASE_TOTAL_BUYERS)
const activeBuyersCount = computed(
  () => BASE_ACTIVE_BUYERS + buyers.value.filter((buyer) => buyer.status === 'Active').length,
)
const suspendedBuyersCount = computed(
  () => BASE_SUSPENDED_BUYERS + buyers.value.filter((buyer) => buyer.status === 'Suspended').length,
)
const newTodayCount = computed(
  () => BASE_NEW_TODAY + buyers.value.filter((buyer) => buyer.joinDate === TODAY).length,
)

const filteredBuyers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return buyers.value.filter((buyer) => {
    if (statusFilter.value !== 'all' && buyer.status !== statusFilter.value) return false
    if (!query) return true

    return [buyer.name, buyer.email, buyer.location, buyer.buyerCode].some((value) =>
      value.toLowerCase().includes(query),
    )
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredBuyers.value.length / pageSize.value)))
const pagedBuyers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredBuyers.value.slice(start, start + pageSize.value)
})

const statCards = computed(() => [
  {
    label: t('buyers.stats.total'),
    value: formatInteger(totalBuyersCount.value),
    sub: t('buyers.stats.totalSub'),
    subClass: '',
    delta: '',
    deltaClass: '',
    iconBg: 'bg-fuchsia-50',
    iconColor: 'text-fuchsia-600',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  },
  {
    label: t('buyers.stats.active'),
    value: formatInteger(activeBuyersCount.value),
    sub: t('buyers.stats.activeSub'),
    subClass: '',
    delta: '▲ 12.4%',
    deltaClass: 'text-success-600',
    iconBg: 'bg-success-50',
    iconColor: 'text-success-600',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
  },
  {
    label: t('buyers.stats.newToday'),
    value: formatInteger(newTodayCount.value),
    sub: t('buyers.stats.newTodaySub'),
    subClass: '',
    delta: '',
    deltaClass: '',
    iconBg: 'bg-brand-50',
    iconColor: 'text-brand-600',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>',
  },
  {
    label: t('buyers.stats.suspended'),
    value: formatInteger(suspendedBuyersCount.value),
    sub: t('buyers.stats.suspendedSub'),
    subClass: 'text-error-600',
    delta: '',
    deltaClass: '',
    iconBg: 'bg-error-50',
    iconColor: 'text-error-600',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  },
  {
    label: t('buyers.stats.avgLtv'),
    value: formatCurrency(AVG_LTV),
    sub: t('buyers.stats.avgLtvSub'),
    subClass: '',
    delta: '',
    deltaClass: '',
    iconBg: 'bg-warning-50',
    iconColor: 'text-warning-600',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="6" x2="12" y2="18"/></svg>',
  },
])

watch([searchQuery, statusFilter, pageSize], () => {
  currentPage.value = 1
})

const formatInteger = (value: number) => integerFormatter.format(value)

const formatCurrency = (value: number) => currencyFormatter.format(value)

const formatJoinDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : monthFormatter.format(date)
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleExport = () => {
  appStore.notifyInfo(t('buyers.notifications.exportQueued'), t('buyers.notifications.exportQueuedSub'))
}

const handleInspect = (buyer: BuyerRow) => {
  appStore.notifyInfo(t('buyers.notifications.buyerProfile'), t('buyers.notifications.buyerProfileSub', { name: buyer.name }))
}

const handleReinstate = (buyer: BuyerRow) => {
  buyer.status = 'Active'
  appStore.notifySuccess(t('buyers.notifications.reinstated'), t('buyers.notifications.reinstatedSub', { name: buyer.name }))
}

const handleSuspend = async (buyer: BuyerRow) => {
  const result = await openConfirmModal({
    variant: 'danger',
    title: t('buyers.modals.suspendTitle'),
    message: t('buyers.modals.suspendMessage', { name: buyer.name }),
    confirmText: t('buyers.modals.suspendConfirm'),
    cancelText: t('buyers.modals.cancel'),
    confirmVariant: 'danger',
  })

  if (result !== 'confirm') return

  buyer.status = 'Suspended'
  appStore.notifyWarning(t('buyers.notifications.suspended'), t('buyers.notifications.suspendedSub', { name: buyer.name }))
}
</script>

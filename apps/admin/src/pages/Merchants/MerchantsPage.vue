<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="$t('merchants.title')">
    </PageBreadcrumb>

    <div class="mt-4 mb-4 flex flex-wrap items-center justify-end gap-2">
      <Button variant="outline" size="sm">{{ $t('merchants.actions.exportCsv') }}</Button>
      <Button variant="outline" size="sm">{{ $t('merchants.actions.sendAnnouncement') }}</Button>
      <Button variant="primary" size="sm" :startIcon="PlusIcon">{{ $t('merchants.actions.inviteMerchant') }}</Button>
    </div>

    <div class="flex flex-col gap-5 pb-6">
      <!-- KPI Strip -->
      <div class="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="grid grid-cols-5 divide-x divide-gray-100 dark:divide-gray-800">
          <div v-for="kpi in kpiStrip" :key="kpi.label" class="px-5 py-4">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ kpi.label }}</p>
            <p class="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{{ kpi.value }}</p>
            <p v-if="kpi.sub" class="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{{ kpi.sub }}</p>
          </div>
        </div>
      </div>

      <!-- Table + Right Rail -->
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
        <!-- Table Card -->
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <!-- Status filter tabs -->
          <div class="border-b border-gray-200 px-5 dark:border-gray-800">
            <Tabs v-model="activeTab" :options="statusTabOptions" />
          </div>

          <!-- Filters row -->
          <div class="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-3 dark:border-gray-800">
            <Input
              v-model="searchQuery"
              :placeholder="$t('merchants.filters.searchPlaceholder')"
              class="min-w-[280px] flex-1"
            />
            <div class="min-w-[180px] flex-1 xl:max-w-[220px]">
              <Select v-model="categoryFilter" :options="categoryOptions" />
            </div>
            <div class="min-w-[180px] flex-1 xl:max-w-[220px]">
              <Select v-model="tierFilter" :options="tierOptions" />
            </div>
            <div class="min-w-[180px] flex-1 xl:max-w-[220px]">
              <Select v-model="regionFilter" :options="regionOptions" />
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-400">
                  <th class="px-5 py-3 text-left">
                    <Checkbox
                      :modelValue="selectedIds.length === filteredMerchants.length && filteredMerchants.length > 0"
                      @update:modelValue="toggleSelectAll"
                    />
                  </th>
                  <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('merchants.table.merchant') }}</th>
                  <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('merchants.table.status') }}</th>
                  <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('merchants.table.tier') }}</th>
                  <th class="min-w-[120px] px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('merchants.table.gmv30d') }}</th>
                  <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('merchants.table.orders') }}</th>
                  <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('merchants.table.joined') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="m in filteredMerchants"
                  :key="m.id"
                  class="border-b border-gray-100 hover:bg-gray-50 last:border-0 dark:border-gray-800 dark:hover:bg-white/5"
                >
                  <td class="px-5 py-3">
                    <Checkbox
                      :modelValue="selectedIds.includes(m.id)"
                      @update:modelValue="() => toggleSelect(m.id)"
                    />
                  </td>
                  <td class="px-5 py-3">
                    <div class="flex items-center gap-3">
                      <div
                        :style="{ background: m.logoColor }"
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                      >
                        {{ m.initials }}
                      </div>
                      <div>
                        <div class="flex items-center gap-1.5">
                          <span class="text-sm font-medium text-gray-900 dark:text-white/90">{{ m.name }}</span>
                          <svg v-if="m.status === 'active'" class="h-3.5 w-3.5 text-brand-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <span class="text-xs text-gray-400 dark:text-gray-500">{{ m.region }} · {{ m.category }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-3">
                    <Badge size="sm" :color="statusBadgeMeta(m.status).color">
                      {{ statusLabel(m.status) }}
                    </Badge>
                  </td>
                  <td class="px-5 py-3">
                    <Badge size="sm" color="primary">
                      {{ m.tier }}
                    </Badge>
                  </td>
                  <td class="px-5 py-3">
                    <div class="space-y-1">
                      <span class="text-sm font-medium text-gray-900 dark:text-white/90">{{ m.gmv30d }}</span>
                      <div class="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div class="h-1.5 rounded-full bg-brand-500" :style="{ width: m.gmvBarPct + '%' }" />
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{ m.orders.toLocaleString() }}</td>
                  <td class="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{{ m.joined }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination footer -->
          <div class="flex items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('merchants.pagination.showing', { count: filteredMerchants.length, total: merchants.length }) }}
            </span>
            <div class="flex gap-1">
              <button class="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5">←</button>
              <button class="rounded-lg border border-brand-500 bg-brand-500 px-3 py-1 text-sm text-white">1</button>
              <button class="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5">→</button>
            </div>
          </div>

          <div
            v-if="selectedIds.length > 0"
            class="sticky bottom-4 z-10 px-4 pb-4"
          >
            <div class="flex flex-col gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 shadow-lg dark:border-brand-800 dark:bg-brand-500/10 lg:flex-row lg:items-center">
              <span class="text-sm font-medium text-brand-700 dark:text-brand-400">
                {{ $t('merchants.bulk.selected', { count: selectedIds.length }) }}
              </span>
              <div class="flex flex-1 flex-wrap items-center gap-2 lg:justify-end">
                <Button variant="outline" size="sm">{{ $t('merchants.bulk.approveKyb') }}</Button>
                <Button variant="outline" size="sm">{{ $t('merchants.bulk.suspend') }}</Button>
                <Button variant="danger" size="sm">{{ $t('merchants.bulk.archive') }}</Button>
                <Button variant="outline" size="sm" @click="selectedIds = []">
                  {{ $t('merchants.bulk.clear') }}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Rail -->
        <div class="flex flex-col gap-5" style="position: sticky; top: 88px; align-self: start;">
          <!-- KYC Queue -->
          <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div class="mb-3 flex items-center justify-between">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ $t('merchants.kyc.title') }}</p>
              <Badge size="sm" color="warning">{{ kycQueue.length }}</Badge>
            </div>
            <ul class="space-y-3">
              <li v-for="item in kycQueue" :key="item.id" class="flex items-center gap-3">
                <div
                  :style="{ background: item.color }"
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                >
                  {{ item.initials }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-gray-900 dark:text-white/90">{{ item.name }}</p>
                  <p class="text-xs text-gray-400 dark:text-gray-500">{{ item.type }} · {{ item.submittedAt }}</p>
                </div>
                <Badge v-if="item.isUrgent" size="sm" color="error" class="shrink-0">{{ t('merchants.kyc.urgent') }}</Badge>
              </li>
            </ul>
            <Button variant="outline" size="sm" class="mt-3 w-full">{{ t('merchants.kyc.reviewAll') }} →</Button>
          </div>

          <!-- Category GMV -->
          <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <p class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">{{ $t('merchants.gmvByCategory') }}</p>
            <ul class="space-y-2.5">
              <li v-for="cat in categoryBreakdown" :key="cat.label" class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ cat.label }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ cat.pct }}%</span>
                </div>
                <div class="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                  <div class="h-1.5 rounded-full" :style="{ width: cat.pct + '%', background: cat.color }" />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AppShell, Badge, PageBreadcrumb, Tabs, Button, Input, Select, Checkbox, PlusIcon } from '@hivespace/shared'
import type { Merchant, KycItem, CategoryBreakdown } from '@/types'

const { t } = useI18n()

type MerchantBadgeColor = 'success' | 'warning' | 'primary' | 'error' | 'light'

const kpiStrip = computed(() => [
  { label: t('merchants.kpi.activeMerchants'), value: '12,487', sub: undefined },
  { label: t('merchants.kpi.gmv7d'),           value: '₫16.8B', sub: t('merchants.kpi.vsPrior', { value: '8.4' }) },
  { label: t('merchants.kpi.pendingKyb'),      value: '247',    sub: undefined },
  { label: t('merchants.kpi.suspended'),        value: '38',     sub: undefined },
  { label: t('merchants.kpi.avgActivation'),   value: '4.2d',   sub: t('merchants.kpi.timeToFirstSale') },
])

const statusTabOptions = computed(() => [
  { label: t('merchants.tabs.all'),        value: 'all' },
  { label: t('merchants.tabs.active'),     value: 'active' },
  { label: t('merchants.tabs.review'),     value: 'review' },
  { label: t('merchants.tabs.pendingKyb'), value: 'pending_kyb' },
  { label: t('merchants.tabs.suspended'),  value: 'suspended' },
])

const activeTab = ref('all')
const searchQuery = ref('')
const categoryFilter = ref('')
const tierFilter = ref('')
const regionFilter = ref('')
const selectedIds = ref<string[]>([])

const categories = ['fb', 'fashion', 'electronics', 'home', 'beauty', 'sports']

const categoryOptions = computed(() => [
  { value: '', label: t('merchants.filters.allCategories') },
  ...categories.map((c) => ({ value: c, label: t(`merchants.categories.${c}`) })),
])

const tierOptions = computed(() => [
  { value: '', label: t('merchants.filters.allTiers') },
  { value: '1', label: t('merchants.filters.tier1') },
  { value: '2', label: t('merchants.filters.tier2') },
  { value: '3', label: t('merchants.filters.tier3') },
  { value: '4', label: t('merchants.filters.tier4') },
])

const regionOptions = computed(() => [
  { value: '', label: t('merchants.filters.allRegions') },
  { value: 'HCM', label: t('merchants.filters.hcm') },
  { value: 'HN',  label: t('merchants.filters.hanoi') },
  { value: 'DN',  label: t('merchants.filters.danang') },
])

const merchants = ref<Merchant[]>([
  { id: '1', name: "Hoa's Kitchen", initials: 'HK', logoColor: 'linear-gradient(135deg,#f97316,#fb923c)', region: 'HCM', status: 'active', tier: 1, category: 'F&B', gmv30d: '₫482M', gmvDelta: 14.2, gmvBarPct: 92, orders: 3847, joined: 'Jan 2023' },
  { id: '2', name: 'VinaTech Store', initials: 'VT', logoColor: 'linear-gradient(135deg,#3b82f6,#60a5fa)', region: 'HN', status: 'active', tier: 2, category: 'Electronics', gmv30d: '₫318M', gmvDelta: 6.1, gmvBarPct: 61, orders: 1524, joined: 'Mar 2023' },
  { id: '3', name: 'Saigon Fashion', initials: 'SF', logoColor: 'linear-gradient(135deg,#ec4899,#f472b6)', region: 'HCM', status: 'review', tier: 2, category: 'Fashion', gmv30d: '₫204M', gmvDelta: -3.2, gmvBarPct: 39, orders: 988, joined: 'Jun 2023' },
  { id: '4', name: 'Mekong Fresh', initials: 'MF', logoColor: 'linear-gradient(135deg,#10b981,#34d399)', region: 'HCM', status: 'active', tier: 3, category: 'F&B', gmv30d: '₫176M', gmvDelta: 22.4, gmvBarPct: 34, orders: 2103, joined: 'Aug 2023' },
  { id: '5', name: 'Hanoi Handmade', initials: 'HH', logoColor: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', region: 'HN', status: 'pending_kyb', tier: 3, category: 'Home', gmv30d: '₫94M', gmvDelta: 0, gmvBarPct: 18, orders: 421, joined: 'Oct 2023' },
  { id: '6', name: 'BeautyVN', initials: 'BV', logoColor: 'linear-gradient(135deg,#f59e0b,#fbbf24)', region: 'DN', status: 'active', tier: 2, category: 'Beauty', gmv30d: '₫287M', gmvDelta: 9.7, gmvBarPct: 55, orders: 1842, joined: 'Nov 2023' },
  { id: '7', name: 'SportZone', initials: 'SZ', logoColor: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', region: 'HCM', status: 'suspended', tier: 4, category: 'Sports', gmv30d: '₫12M', gmvDelta: -80, gmvBarPct: 2, orders: 88, joined: 'Dec 2023' },
  { id: '8', name: 'Pho 24 Chain', initials: 'P2', logoColor: 'linear-gradient(135deg,#ef4444,#f87171)', region: 'HN', status: 'active', tier: 1, category: 'F&B', gmv30d: '₫521M', gmvDelta: 18.6, gmvBarPct: 100, orders: 4210, joined: 'Feb 2023' },
])

const kycQueue = computed<KycItem[]>(() => [
  { id: '1', name: 'Hanoi Handmade', type: t('merchants.kyc.types.identity'), submittedAt: '2h ago', isUrgent: true, initials: 'HH', color: '#8b5cf6' },
  { id: '2', name: 'TechShop VN', type: t('merchants.kyc.types.business'), submittedAt: '5h ago', isUrgent: true, initials: 'TV', color: '#3b82f6' },
  { id: '3', name: 'HomeDecor HCM', type: t('merchants.kyc.types.bank'), submittedAt: '1d ago', isUrgent: false, initials: 'HD', color: '#f59e0b' },
  { id: '4', name: 'Fresh Market', type: t('merchants.kyc.types.identity'), submittedAt: '2d ago', isUrgent: false, initials: 'FM', color: '#10b981' },
])

const categoryBreakdown = computed<CategoryBreakdown[]>(() => [
  { label: t('merchants.categories.fb'), pct: 34, color: '#f97316' },
  { label: t('merchants.categories.electronics'), pct: 24, color: '#3b82f6' },
  { label: t('merchants.categories.fashion'), pct: 18, color: '#ec4899' },
  { label: t('merchants.categories.beauty'), pct: 12, color: '#f59e0b' },
  { label: t('merchants.categories.home'), pct: 8, color: '#8b5cf6' },
  { label: t('merchants.categories.sports'), pct: 4, color: '#0ea5e9' },
])

const filteredMerchants = computed(() => {
  return merchants.value.filter((m) => {
    if (activeTab.value !== 'all' && m.status !== activeTab.value) return false
    if (searchQuery.value && !m.name.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
    if (categoryFilter.value && m.category !== categoryFilter.value) return false
    if (tierFilter.value && m.tier !== Number(tierFilter.value)) return false
    if (regionFilter.value && m.region !== regionFilter.value) return false
    return true
  })
})

const toggleSelectAll = () => {
  if (selectedIds.value.length === filteredMerchants.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredMerchants.value.map((m) => m.id)
  }
}

const toggleSelect = (id: string) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(idx, 1)
}

const statusLabel = (status: Merchant['status']) => {
  const labels: Record<string, string> = {
    active: t('merchants.status.active'),
    review: t('merchants.status.review'),
    pending_kyb: t('merchants.status.pendingKyb'),
    suspended: t('merchants.status.suspended'),
  }
  return labels[status] ?? status
}

const statusBadgeMeta = (status: Merchant['status']): { color: MerchantBadgeColor } => {
  const colors: Record<string, MerchantBadgeColor> = {
    active: 'success',
    review: 'warning',
    pending_kyb: 'primary',
    suspended: 'error',
  }

  return { color: colors[status] ?? 'light' }
}
</script>

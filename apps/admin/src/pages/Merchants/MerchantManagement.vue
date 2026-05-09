<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="$t('pages.merchants.title')">
      <template #actions>
        <Button variant="outline" size="sm">{{ $t('pages.merchants.actions.exportCsv') }}</Button>
        <Button variant="outline" size="sm">{{ $t('pages.merchants.actions.sendAnnouncement') }}</Button>
        <Button variant="primary" size="sm" :startIcon="PlusIcon">{{ $t('pages.merchants.actions.inviteMerchant') }}</Button>
      </template>
    </PageBreadcrumb>

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
              :placeholder="$t('pages.merchants.filters.searchPlaceholder')"
            />
            <Select v-model="categoryFilter" :options="categoryOptions" />
            <Select v-model="tierFilter" :options="tierOptions" />
            <Select v-model="regionFilter" :options="regionOptions" />
          </div>

          <!-- Bulk actions bar -->
          <div
            v-if="selectedIds.length > 0"
            class="flex items-center gap-3 border-b border-brand-100 bg-brand-50 px-5 py-2 dark:border-brand-800 dark:bg-brand-500/10"
          >
            <span class="text-sm font-medium text-brand-700 dark:text-brand-400">
              {{ $t('pages.merchants.bulk.selected', { count: selectedIds.length }) }}
            </span>
            <Button variant="outline" size="sm">{{ $t('pages.merchants.bulk.approveKyb') }}</Button>
            <Button variant="outline" size="sm">{{ $t('pages.merchants.bulk.suspend') }}</Button>
            <Button variant="danger" size="sm">{{ $t('pages.merchants.bulk.archive') }}</Button>
            <Button variant="outline" size="sm" class="ml-auto" @click="selectedIds = []">
              {{ $t('pages.merchants.bulk.clear') }}
            </Button>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <th class="px-5 py-3 text-left">
                    <Checkbox
                      :modelValue="selectedIds.length === filteredMerchants.length && filteredMerchants.length > 0"
                      @update:modelValue="toggleSelectAll"
                    />
                  </th>
                  <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('pages.merchants.table.merchant') }}</th>
                  <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('pages.merchants.table.status') }}</th>
                  <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('pages.merchants.table.tier') }}</th>
                  <th class="min-w-[120px] px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('pages.merchants.table.gmv30d') }}</th>
                  <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('pages.merchants.table.orders') }}</th>
                  <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('pages.merchants.table.joined') }}</th>
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
                    <span :class="statusBadgeClass(m.status)" class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {{ statusLabel(m.status) }}
                    </span>
                  </td>
                  <td class="px-5 py-3">
                    <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                      {{ m.tier }}
                    </span>
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
          <div class="flex items-center justify-between border-t border-gray-100 px-5 py-3 dark:border-gray-800">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('pages.merchants.pagination.showing', { count: filteredMerchants.length, total: merchants.length }) }}
            </span>
            <div class="flex gap-1">
              <button class="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5">←</button>
              <button class="rounded-lg border border-brand-500 bg-brand-500 px-3 py-1 text-sm text-white">1</button>
              <button class="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5">→</button>
            </div>
          </div>
        </div>

        <!-- Right Rail -->
        <div class="flex flex-col gap-5" style="position: sticky; top: 88px; align-self: start;">
          <!-- KYC Queue -->
          <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div class="mb-3 flex items-center justify-between">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ $t('pages.merchants.kyc.title') }}</p>
              <span class="rounded-full bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-700 dark:bg-warning-500/15 dark:text-warning-400">{{ kycQueue.length }}</span>
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
                <span v-if="item.isUrgent" class="shrink-0 rounded-full bg-error-50 px-2 py-0.5 text-xs font-medium text-error-700 dark:bg-error-500/15 dark:text-error-500">Urgent</span>
              </li>
            </ul>
            <Button variant="outline" size="sm" class="mt-3 w-full">{{ $t('pages.merchants.kyc.reviewAll') }} →</Button>
          </div>

          <!-- Category GMV -->
          <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <p class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">{{ $t('pages.merchants.gmvByCategory') }}</p>
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
import { AppShell, PageBreadcrumb, Tabs, Button, Input, Select, Checkbox, PlusIcon } from '@hivespace/shared'
import type { Merchant, KycItem, CategoryBreakdown } from '@/types'

const { t } = useI18n()

const kpiStrip = computed(() => [
  { label: t('pages.merchants.kpi.activeMerchants'), value: '12,487', sub: undefined },
  { label: t('pages.merchants.kpi.gmv7d'),           value: '₫16.8B', sub: '↑ 8.4% vs prior' },
  { label: t('pages.merchants.kpi.pendingKyb'),      value: '247',    sub: undefined },
  { label: t('pages.merchants.kpi.suspended'),        value: '38',     sub: undefined },
  { label: t('pages.merchants.kpi.avgActivation'),   value: '4.2d',   sub: t('pages.merchants.kpi.timeToFirstSale') },
])

const statusTabOptions = computed(() => [
  { label: t('pages.merchants.tabs.all'),        value: 'all' },
  { label: t('pages.merchants.tabs.active'),     value: 'active' },
  { label: t('pages.merchants.tabs.review'),     value: 'review' },
  { label: t('pages.merchants.tabs.pendingKyb'), value: 'pending_kyb' },
  { label: t('pages.merchants.tabs.suspended'),  value: 'suspended' },
])

const activeTab = ref('all')
const searchQuery = ref('')
const categoryFilter = ref('')
const tierFilter = ref('')
const regionFilter = ref('')
const selectedIds = ref<string[]>([])

const categories = ['F&B', 'Fashion', 'Electronics', 'Home', 'Beauty', 'Sports']

const categoryOptions = computed(() => [
  { value: '', label: t('pages.merchants.filters.allCategories') },
  ...categories.map((c) => ({ value: c, label: c })),
])

const tierOptions = computed(() => [
  { value: '', label: t('pages.merchants.filters.allTiers') },
  { value: '1', label: t('pages.merchants.filters.tier1') },
  { value: '2', label: t('pages.merchants.filters.tier2') },
  { value: '3', label: t('pages.merchants.filters.tier3') },
  { value: '4', label: t('pages.merchants.filters.tier4') },
])

const regionOptions = computed(() => [
  { value: '', label: t('pages.merchants.filters.allRegions') },
  { value: 'HCM', label: t('pages.merchants.filters.hcm') },
  { value: 'HN',  label: t('pages.merchants.filters.hanoi') },
  { value: 'DN',  label: t('pages.merchants.filters.danang') },
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

const kycQueue = ref<KycItem[]>([
  { id: '1', name: 'Hanoi Handmade', type: 'Identity doc', submittedAt: '2h ago', isUrgent: true, initials: 'HH', color: '#8b5cf6' },
  { id: '2', name: 'TechShop VN', type: 'Business reg.', submittedAt: '5h ago', isUrgent: true, initials: 'TV', color: '#3b82f6' },
  { id: '3', name: 'HomeDecor HCM', type: 'Bank statement', submittedAt: '1d ago', isUrgent: false, initials: 'HD', color: '#f59e0b' },
  { id: '4', name: 'Fresh Market', type: 'Identity doc', submittedAt: '2d ago', isUrgent: false, initials: 'FM', color: '#10b981' },
])

const categoryBreakdown = ref<CategoryBreakdown[]>([
  { label: 'F&B', pct: 34, color: '#f97316' },
  { label: 'Electronics', pct: 24, color: '#3b82f6' },
  { label: 'Fashion', pct: 18, color: '#ec4899' },
  { label: 'Beauty', pct: 12, color: '#f59e0b' },
  { label: 'Home', pct: 8, color: '#8b5cf6' },
  { label: 'Sports', pct: 4, color: '#0ea5e9' },
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
    active: t('pages.merchants.status.active'),
    review: t('pages.merchants.status.review'),
    pending_kyb: t('pages.merchants.status.pendingKyb'),
    suspended: t('pages.merchants.status.suspended'),
  }
  return labels[status] ?? status
}

const statusBadgeClass = (status: Merchant['status']) => {
  const classes: Record<string, string> = {
    active: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500',
    review: 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400',
    pending_kyb: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400',
    suspended: 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500',
  }
  return classes[status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
}
</script>

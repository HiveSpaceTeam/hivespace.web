<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="$t('pages.dashboard.pageTitle')">
      <template #actions>
        <Button variant="outline" size="sm">{{ $t('pages.dashboard.actions.exportAudit') }}</Button>
        <Button variant="primary" size="sm" :startIcon="PlusIcon">{{ $t('pages.dashboard.actions.inviteAdmin') }}</Button>
      </template>
    </PageBreadcrumb>

    <div class="grid grid-cols-12 gap-5 pb-6">
      <!-- KPI Cards -->
      <div class="col-span-12 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="kpi in kpiCards"
          :key="kpi.label"
          class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ kpi.label }}</p>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{{ kpi.value }}</p>
          <div class="mt-2 flex items-center gap-1.5">
            <span
              :class="[
                'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
                kpi.deltaPositive
                  ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500'
                  : 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500',
              ]"
            >
              <svg v-if="kpi.deltaPositive" class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <svg v-else class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              {{ kpi.delta }}
            </span>
            <span class="text-xs text-gray-400 dark:text-gray-500">{{ $t('pages.dashboard.kpi.vsLast30d') }}</span>
          </div>
        </div>
      </div>

      <!-- Chart + Activity -->
      <div class="col-span-12 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <!-- GMV Chart -->
        <div class="xl:col-span-2 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('pages.dashboard.chart.title') }}</p>
              <p class="mt-0.5 text-xl font-semibold text-gray-900 dark:text-white">₫{{ currentGmvTotal }}</p>
            </div>
            <div class="flex gap-1 rounded-lg border border-gray-200 p-1 dark:border-gray-800">
              <button
                v-for="period in chartPeriods"
                :key="period"
                @click="activePeriod = period"
                :class="[
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  activePeriod === period
                    ? 'bg-brand-500 text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
                ]"
              >
                {{ period }}
              </button>
            </div>
          </div>
          <VueApexCharts type="area" height="220" :options="chartOptions" :series="chartSeries" />
        </div>

        <!-- Recent Activity -->
        <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p class="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{{ $t('pages.dashboard.activity.title') }}</p>
          <ul class="space-y-4">
            <li v-for="item in recentActivity" :key="item.id" class="flex gap-3">
              <div :class="['mt-0.5 h-2 w-2 shrink-0 rounded-full', item.color]" />
              <div class="min-w-0 flex-1">
                <p class="text-sm text-gray-700 dark:text-gray-300">{{ item.text }}</p>
                <p class="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{{ item.time }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Admin Accounts Table -->
      <div class="col-span-12 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ $t('pages.dashboard.adminTable.title') }}</p>
          <router-link
            to="/account/admin-management"
            class="text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            {{ $t('pages.dashboard.adminTable.viewAll') }} →
          </router-link>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('pages.dashboard.adminTable.email') }}</th>
                <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('pages.dashboard.adminTable.fullName') }}</th>
                <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('pages.dashboard.adminTable.status') }}</th>
                <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('pages.dashboard.adminTable.systemAdmin') }}</th>
                <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('pages.dashboard.adminTable.created') }}</th>
                <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $t('pages.dashboard.adminTable.lastLogin') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="admin in mockAdmins"
                :key="admin.id"
                class="border-b border-gray-200 hover:bg-gray-50 last:border-0 dark:border-gray-700 dark:hover:bg-white/5"
              >
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <div
                      :style="{ background: admin.avatarColor }"
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                    >
                      {{ admin.initials }}
                    </div>
                    <span class="text-sm text-gray-800 dark:text-white/90">{{ admin.email }}</span>
                  </div>
                </td>
                <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{ admin.fullName }}</td>
                <td class="px-5 py-3">
                  <Badge size="sm" :color="admin.active ? 'success' : 'error'">
                    {{ admin.active ? $t('admins.active') : $t('admins.inactive') }}
                  </Badge>
                </td>
                <td class="px-5 py-3">
                  <svg v-if="admin.isSystemAdmin" class="h-5 w-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </td>
                <td class="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{{ admin.createdAt }}</td>
                <td class="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{{ admin.lastLogin }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ApexOptions } from 'apexcharts'
import VueApexCharts from 'vue3-apexcharts'
import { AppShell, PageBreadcrumb, Badge, Button, PlusIcon } from '@hivespace/shared'

const { t } = useI18n()

const kpiCards = computed(() => [
  { label: t('pages.dashboard.kpi.activeMerchants'), value: '12,487', delta: '4.8%', deltaPositive: true },
  { label: t('pages.dashboard.kpi.gmvLast24h'),      value: '₫2.4B',  delta: '12.1%', deltaPositive: true },
  { label: t('pages.dashboard.kpi.openDisputes'),    value: '142',    delta: '+9',    deltaPositive: false },
  { label: t('pages.dashboard.kpi.kycPending'),      value: '14',     delta: '2',     deltaPositive: false },
])

const recentActivity = [
  { id: 1, text: "Merchant \"Hoa's Kitchen\" approved KYB", time: '2 min ago', color: 'bg-success-500' },
  { id: 2, text: 'Admin account created for nganle@hive.vn', time: '18 min ago', color: 'bg-brand-500' },
  { id: 3, text: 'Dispute #4821 escalated — ₫2.1M GMV at risk', time: '1h 4min ago', color: 'bg-warning-500' },
  { id: 4, text: 'Payment provider VNPay health check passed', time: '2h 12min ago', color: 'bg-success-400' },
]

const mockAdmins = [
  { id: '1', email: 'anhtuan@hive.vn', fullName: 'Anh Tuấn', initials: 'AT', avatarColor: '#465fff', active: true, isSystemAdmin: true, createdAt: '10 Jan 2024', lastLogin: '5 min ago' },
  { id: '2', email: 'nganle@hive.vn', fullName: 'Ngân Lê', initials: 'NL', avatarColor: '#0ea5e9', active: true, isSystemAdmin: false, createdAt: '14 Feb 2024', lastLogin: '2h ago' },
  { id: '3', email: 'minhtri@hive.vn', fullName: 'Minh Trí', initials: 'MT', avatarColor: '#8b5cf6', active: true, isSystemAdmin: false, createdAt: '3 Mar 2024', lastLogin: 'Yesterday' },
  { id: '4', email: 'phuonganh@hive.vn', fullName: 'Phương Anh', initials: 'PA', avatarColor: '#f59e0b', active: false, isSystemAdmin: false, createdAt: '22 Mar 2024', lastLogin: '3 days ago' },
  { id: '5', email: 'duclong@hive.vn', fullName: 'Đức Long', initials: 'DL', avatarColor: '#10b981', active: true, isSystemAdmin: false, createdAt: '1 Apr 2024', lastLogin: 'Today' },
]

const chartPeriods = ['7D', '30D', 'QTD']
const activePeriod = ref('30D')

const gmvData: Record<string, number[]> = {
  '7D': [2.1, 2.3, 1.9, 2.4, 2.6, 2.2, 2.4],
  '30D': [1.8, 2.0, 1.7, 1.9, 2.1, 2.3, 2.0, 2.2, 1.9, 2.4, 2.1, 2.3, 2.5, 2.2, 2.4, 2.6, 2.3, 2.5, 2.1, 2.3, 2.0, 2.2, 2.4, 2.1, 2.3, 2.5, 2.2, 2.4, 2.3, 2.4],
  'QTD': [1.5, 1.7, 1.6, 1.8, 2.0, 1.9, 2.1, 2.0, 2.2, 2.1, 2.3, 2.2, 2.4, 2.3, 2.5, 2.4, 2.3, 2.5, 2.4, 2.6, 2.5, 2.4, 2.6, 2.5, 2.7, 2.6, 2.5, 2.7, 2.6, 2.4, 2.5, 2.3, 2.4, 2.2, 2.3, 2.4, 2.3, 2.4, 2.3, 2.4, 2.3, 2.4, 2.5, 2.4, 2.3, 2.4, 2.5, 2.4, 2.5, 2.4, 2.5, 2.6, 2.5, 2.6, 2.5, 2.6, 2.7, 2.6, 2.7, 2.8, 2.7, 2.8, 2.7, 2.8, 2.9, 2.8, 2.9, 2.8, 2.9, 3.0, 2.9, 3.0, 2.9, 3.0, 2.9, 3.0, 3.1, 3.0, 3.1, 3.0, 3.1, 3.2, 3.1, 3.2, 3.1, 3.2, 3.3, 3.2, 3.3, 3.2],
}

const currentGmvTotal = computed(() => {
  const data = gmvData[activePeriod.value]
  const total = data.reduce((a, b) => a + b, 0)
  return total.toFixed(1) + 'B'
})

const chartSeries = computed(() => [
  { name: 'GMV (₫B)', data: gmvData[activePeriod.value] },
])

const chartOptions = ref<ApexOptions>({
  chart: {
    type: 'area',
    toolbar: { show: false },
    sparkline: { enabled: false },
    fontFamily: 'Inter, sans-serif',
    animations: { enabled: true, speed: 300 },
  },
  colors: ['#465fff'],
  fill: {
    type: 'gradient',
    gradient: { opacityFrom: 0.4, opacityTo: 0.0, shadeIntensity: 1 },
  },
  stroke: { curve: 'smooth', width: 2 },
  dataLabels: { enabled: false },
  markers: { size: 0 },
  grid: {
    borderColor: '#f1f5f9',
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { left: 0, right: 0 },
  },
  xaxis: {
    type: 'numeric',
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { show: false },
    tooltip: { enabled: false },
  },
  yaxis: {
    labels: {
      formatter: (v: number) => '₫' + v.toFixed(1) + 'B',
      style: { fontSize: '11px', colors: ['#94a3b8'] },
    },
  },
  tooltip: {
    y: { formatter: (v: number) => '₫' + v.toFixed(2) + 'B' },
  },
})
</script>

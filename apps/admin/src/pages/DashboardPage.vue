<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="$t('dashboard.title')">
      <template #actions>
        <Button variant="outline" size="sm">{{ $t('dashboard.actions.exportAudit') }}</Button>
        <Button variant="primary" size="sm" :startIcon="PlusIcon">{{ $t('dashboard.actions.inviteAdmin') }}</Button>
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
            <span class="text-xs text-gray-400 dark:text-gray-500">{{ $t('dashboard.kpi.vsLast30d') }}</span>
          </div>
        </div>
      </div>

      <!-- Chart + Activity -->
      <div class="col-span-12 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <!-- GMV Chart -->
        <div class="xl:col-span-2 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('dashboard.chart.title') }}</p>
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
          <p class="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{{ $t('dashboard.activity.title') }}</p>
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

      <!-- Recent Admin Sign-ins -->
      <div class="col-span-12 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ $t('dashboard.adminTable.title') }}</p>
            <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{{ $t('dashboard.adminTable.subtitle') }}</p>
          </div>
          <router-link
            to="/accounts"
            class="inline-flex h-9 items-center rounded-lg border border-gray-200 px-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          >
            {{ $t('dashboard.adminTable.viewAll') }} →
          </router-link>
        </div>
        <div class="px-2 py-1.5">
          <router-link
            v-for="admin in recentSignIns"
            :key="admin.id"
            to="/accounts"
            class="grid cursor-pointer items-center gap-3.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
            style="grid-template-columns: 36px 1fr auto auto"
          >
            <span
              :style="{ background: admin.avatarColor }"
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            >
              {{ admin.initials }}
            </span>
            <div class="min-w-0">
              <p class="text-[13px] font-medium text-gray-900 dark:text-white">{{ admin.fullName }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ admin.email }}</p>
            </div>
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              :style="{ background: admin.roleColor.bg, color: admin.roleColor.text }"
            >
              <span
                class="h-1.5 w-1.5 rounded-full"
                :style="{ background: admin.roleColor.dot }"
              />
              {{ admin.role }}
            </span>
            <span class="whitespace-nowrap text-xs tabular-nums text-gray-500 dark:text-gray-400">
              {{ admin.signedInAt }}
            </span>
          </router-link>
        </div>
        <div class="flex items-center border-t border-gray-200 px-5 py-3 text-[13px] text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <span>
            {{ $t('dashboard.adminTable.footerStats') }}
            <router-link to="/accounts" class="font-medium text-brand-600 hover:text-brand-700">
              {{ $t('dashboard.adminTable.manageAll') }} →
            </router-link>
          </span>
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
import { AppShell, PageBreadcrumb, Button, PlusIcon } from '@hivespace/shared'

const { t } = useI18n()

const kpiCards = computed(() => [
  { label: t('dashboard.kpi.activeMerchants'), value: '12,487', delta: '4.8%', deltaPositive: true },
  { label: t('dashboard.kpi.gmvLast24h'),      value: '₫2.4B',  delta: '12.1%', deltaPositive: true },
  { label: t('dashboard.kpi.openDisputes'),    value: '142',    delta: '+9',    deltaPositive: false },
  { label: t('dashboard.kpi.kycPending'),      value: '14',     delta: '2',     deltaPositive: false },
])

const recentActivity = [
  { id: 1, text: "Merchant \"Hoa's Kitchen\" approved KYB", time: '2 min ago', color: 'bg-success-500' },
  { id: 2, text: 'Admin account created for nganle@hive.vn', time: '18 min ago', color: 'bg-brand-500' },
  { id: 3, text: 'Dispute #4821 escalated — ₫2.1M GMV at risk', time: '1h 4min ago', color: 'bg-warning-500' },
  { id: 4, text: 'Payment provider VNPay health check passed', time: '2h 12min ago', color: 'bg-success-400' },
]

const recentSignIns = [
  {
    id: '1',
    email: 'anhtuan@hivespace.vn',
    fullName: 'Nguyễn Anh Tuấn',
    initials: 'NT',
    avatarColor: '#465fff',
    role: 'Super Admin',
    roleColor: { bg: 'rgba(122,90,248,.12)', text: '#6938ef', dot: '#7a5af8' },
    signedInAt: '3m ago · Hà Nội',
  },
  {
    id: '2',
    email: 'thumai@hivespace.vn',
    fullName: 'Trần Thu Mai',
    initials: 'TM',
    avatarColor: '#7a5af8',
    role: 'Compliance',
    roleColor: { bg: 'var(--color-warning-50, #fffaeb)', text: 'var(--color-warning-700, #b54708)', dot: 'var(--color-warning-500, #f79009)' },
    signedInAt: '1h ago · Hà Nội',
  },
  {
    id: '3',
    email: 'quochuy@hivespace.vn',
    fullName: 'Phạm Quốc Huy',
    initials: 'PQ',
    avatarColor: '#ee46bc',
    role: 'Finance',
    roleColor: { bg: 'var(--color-success-50, #ecfdf3)', text: 'var(--color-success-700, #027a48)', dot: 'var(--color-success-500, #12b76a)' },
    signedInAt: '18m ago · TP. HCM',
  },
  {
    id: '4',
    email: 'honghai@hivespace.vn',
    fullName: 'Lê Hồng Hải',
    initials: 'LH',
    avatarColor: '#f79009',
    role: 'Risk',
    roleColor: { bg: 'rgba(238,70,188,.12)', text: '#c11574', dot: '#ee46bc' },
    signedInAt: '45m ago · Đà Nẵng',
  },
  {
    id: '5',
    email: 'dangtan@hivespace.vn',
    fullName: 'Đặng Tấn Dũng',
    initials: 'ĐT',
    avatarColor: '#0ba5ec',
    role: 'Locked · 5 attempts',
    roleColor: { bg: 'var(--color-warning-50, #fffaeb)', text: 'var(--color-warning-700, #b54708)', dot: 'var(--color-warning-500, #f79009)' },
    signedInAt: '36h ago · Hà Nội',
  },
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
  return total.toFixed(1) + t('dashboard.kpi.gmvUnit')
})

const chartSeries = computed(() => [
  { name: t('dashboard.chart.gmvSeries'), data: gmvData[activePeriod.value] },
])

const chartOptions = computed<ApexOptions>(() => ({
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
      formatter: (v: number) => '₫' + v.toFixed(1) + t('dashboard.kpi.gmvUnit'),
      style: { fontSize: '11px', colors: ['#94a3b8'] },
    },
  },
  tooltip: {
    y: { formatter: (v: number) => t('dashboard.chart.tooltipUnit', { value: v.toFixed(2) }) },
  },
}))
</script>

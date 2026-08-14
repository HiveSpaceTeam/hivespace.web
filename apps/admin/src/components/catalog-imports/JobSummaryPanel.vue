<template>
  <section class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="text-xs uppercase text-gray-500">{{ $t('catalogImports.jobs.jobId') }}</p>
        <h1 class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
          {{ job.jobId }}
        </h1>
      </div>
      <Badge :color="statusColor">{{ $t(`catalogImports.statuses.${job.status}`, job.status) }}</Badge>
    </div>

    <dl class="mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-5">
      <div class="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
        <dt class="text-xs text-gray-500">{{ $t('catalogImports.jobs.operationType') }}</dt>
        <dd class="mt-1 font-semibold text-gray-900 dark:text-white">
          {{ $t(`catalogImports.operationTypes.${job.operationType}`, job.operationType) }}
        </dd>
      </div>
      <div class="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
        <dt class="text-xs text-gray-500">{{ $t('catalogImports.jobs.sourceFileName') }}</dt>
        <dd class="mt-1 font-semibold text-gray-900 dark:text-white">
          {{ job.sourceFileName ?? $t('common.emptyValue') }}
        </dd>
      </div>
      <div class="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
        <dt class="text-xs text-gray-500">{{ $t('catalogImports.jobs.requestedAt') }}</dt>
        <dd class="mt-1 font-semibold text-gray-900 dark:text-white">
          {{ formatTimestamp(job.requestedAt) }}
        </dd>
      </div>
      <div class="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
        <dt class="text-xs text-gray-500">{{ $t('catalogImports.jobs.startedAt') }}</dt>
        <dd class="mt-1 font-semibold text-gray-900 dark:text-white">
          {{ formatTimestamp(job.startedAt) }}
        </dd>
      </div>
      <div class="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
        <dt class="text-xs text-gray-500">{{ $t('catalogImports.jobs.completedAt') }}</dt>
        <dd class="mt-1 font-semibold text-gray-900 dark:text-white">
          {{ formatTimestamp(job.completedAt) }}
        </dd>
      </div>
      <div class="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
        <dt class="text-xs text-gray-500">{{ $t('catalogImports.jobs.progress') }}</dt>
        <dd class="mt-1 font-semibold text-gray-900 dark:text-white">{{ progressText }}</dd>
      </div>
    </dl>

    <section v-if="resultSummaryItems.length > 0" class="mt-5">
      <h2 class="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
        {{ $t('catalogImports.jobs.resultSummary') }}
      </h2>
      <dl class="mt-3 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="item in resultSummaryItems"
          :key="item.key"
          class="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
        >
          <dt class="text-xs text-gray-500">{{ $t(item.labelKey) }}</dt>
          <dd class="mt-1 font-semibold text-gray-900 dark:text-white">{{ item.value }}</dd>
        </div>
      </dl>
    </section>

    <p v-if="job.errorSummary" class="mt-4 rounded-lg bg-error-50 p-3 text-sm text-error-600">
      {{ job.errorSummary }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Badge, useFormatDate } from '@hivespace/shared'
import { useI18n } from 'vue-i18n'
import type { CatalogImportJobDetail } from '@/types'

const props = defineProps<{
  job: CatalogImportJobDetail
}>()

const { t } = useI18n()
const { formatDateTime, formatRelativeTime } = useFormatDate()

const statusColor = computed(() => {
  if (props.job.status === 'Completed') return 'success'
  if (props.job.status === 'Failed') return 'error'
  if (props.job.status === 'Running') return 'warning'
  return 'info'
})

const progressText = computed(() => {
  const progress = props.job.progress
  if (!progress) return t('common.emptyValue')

  return t('catalogImports.jobs.progressValue', {
    processed: progress.processed,
    total: progress.total,
  })
})

const resultSummaryItems = computed(() => {
  const summary = props.job.resultSummary
  if (!summary) return []

  return [
    { key: 'totalCategories', labelKey: 'catalogImports.results.totalCategories', value: summary.totalCategories },
    { key: 'totalProducts', labelKey: 'catalogImports.results.totalProducts', value: summary.totalProducts },
    { key: 'readyProducts', labelKey: 'catalogImports.results.readyProducts', value: summary.readyProducts },
    { key: 'blockedProducts', labelKey: 'catalogImports.results.blockedProducts', value: summary.blockedProducts },
    { key: 'warningCount', labelKey: 'catalogImports.results.warningCount', value: summary.warningCount },
    { key: 'duplicateCount', labelKey: 'catalogImports.results.duplicateCount', value: summary.duplicateCount },
    { key: 'created', labelKey: 'catalogImports.results.created', value: summary.created },
    { key: 'matched', labelKey: 'catalogImports.results.matched', value: summary.matched },
    { key: 'failed', labelKey: 'catalogImports.results.failed', value: summary.failed },
    { key: 'conflict', labelKey: 'catalogImports.results.conflict', value: summary.conflict },
    { key: 'imported', labelKey: 'catalogImports.results.imported', value: summary.imported },
    { key: 'skipped', labelKey: 'catalogImports.results.skipped', value: summary.skipped },
    { key: 'blocked', labelKey: 'catalogImports.results.blocked', value: summary.blocked },
  ].filter(item => item.value !== undefined && item.value !== null)
})

const formatTimestamp = (value?: string | null) => {
  if (!value) return t('common.emptyValue')

  return `${formatDateTime(value)} (${formatRelativeTime(value, { t })})`
}
</script>

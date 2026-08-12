<template>
  <aside class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
    <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
      <h2 class="text-base font-semibold text-gray-900 dark:text-white">
        {{ $t('catalogImports.sections.relatedJobs') }}
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        {{ $t('catalogImports.jobs.relatedDescription') }}
      </p>
    </div>

    <div v-if="selectedBundle" class="space-y-4 p-5">
      <div class="rounded-lg bg-gray-50 p-4 dark:bg-white/[0.03]">
        <p class="text-xs uppercase tracking-[0.08em] text-gray-500">
          {{ $t('catalogImports.bundles.bundleId') }}
        </p>
        <p class="mt-1 font-medium text-gray-900 dark:text-white">{{ selectedBundle.bundleId }}</p>
        <p class="mt-2 text-sm text-gray-500">
          {{ selectedBundle.sourceFileName ?? $t('common.emptyValue') }}
        </p>
      </div>

      <div v-if="loading && jobs.length === 0" class="py-10 text-center">
        <Spinner />
      </div>
      <div v-else class="space-y-3">
        <button
          v-for="job in jobs"
          :key="job.jobId"
          type="button"
          class="block w-full rounded-lg border border-gray-200 px-4 py-3 text-left transition hover:border-brand-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
          @click="emit('openJob', job.jobId)"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ job.jobId }}</p>
              <p class="mt-1 text-sm text-gray-500">
                {{ $t(`catalogImports.operationTypes.${job.operationType}`, job.operationType) }}
              </p>
            </div>
            <Badge :color="statusColor(job.status)">
              {{ $t(`catalogImports.statuses.${job.status}`, job.status) }}
            </Badge>
          </div>
          <p class="mt-2 text-sm text-gray-500">{{ formatTimestamp(job.requestedAt) }}</p>
        </button>
        <p v-if="jobs.length === 0" class="py-6 text-sm text-gray-500">
          {{ $t('catalogImports.empty.relatedJobs') }}
        </p>
      </div>
    </div>

    <div v-else class="p-5 text-sm text-gray-500">
      {{ $t('catalogImports.empty.relatedJobsSelection') }}
    </div>

    <div v-if="selectedBundle" class="border-t border-gray-200 px-5 py-4 dark:border-gray-800">
      <Pagination
        :currentPage="pagination.currentPage"
        :totalPages="pagination.totalPages"
        :pageSize="pagination.pageSize"
        :totalItems="pagination.totalItems"
        @pageChange="page => emit('pageChange', page)"
        @pageSizeChange="size => emit('pageSizeChange', size)"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  Badge,
  Pagination,
  Spinner,
  type PaginationMetadata,
  useFormatDate,
} from '@hivespace/shared'
import { useI18n } from 'vue-i18n'
import type { CatalogImportBundleSummary, CatalogImportJobHistoryRow } from '@/types'

defineProps<{
  selectedBundle: CatalogImportBundleSummary | null
  jobs: CatalogImportJobHistoryRow[]
  pagination: PaginationMetadata
  loading?: boolean
}>()

const emit = defineEmits<{
  openJob: [jobId: string]
  pageChange: [page: number]
  pageSizeChange: [pageSize: number]
}>()

const { t } = useI18n()
const { formatDateTime, formatRelativeTime } = useFormatDate()

const statusColor = (status: string) => {
  if (status === 'Completed') return 'success'
  if (status === 'Failed') return 'error'
  if (status === 'Running') return 'warning'
  return 'info'
}

const formatTimestamp = (value?: string | null) => {
  if (!value) return t('common.emptyValue')

  return `${formatDateTime(value)} (${formatRelativeTime(value, { t })})`
}
</script>

<template>
  <section class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
      <div>
        <h2 class="text-base font-semibold text-gray-900 dark:text-white">
          {{ $t(props.titleKey) }}
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          {{ $t(props.descriptionKey) }}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        :disabled="loading"
        :loading="refreshLoading"
        :onClick="() => emit('refresh')"
      >
        {{ $t('catalogImports.actions.refresh') }}
      </Button>
    </div>

    <div v-if="loading && jobs.length === 0" class="p-8 text-center">
      <Spinner />
    </div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr
            class="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-400"
          >
            <th class="px-4 py-3">{{ $t('catalogImports.jobs.jobId') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.jobs.operationType') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.jobs.status') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.jobs.sourceFileName') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.jobs.requestedAt') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.jobs.progress') }}</th>
            <th v-if="showRetryColumn" class="px-4 py-3 text-right"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="job in jobs"
            :key="job.jobId"
            class="cursor-pointer border-b border-gray-100 text-sm transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
            @click="emit('select', job.jobId)"
          >
            <td class="px-4 py-4 font-medium text-gray-900 dark:text-white">
              <button
                type="button"
                class="text-left text-brand-600 hover:text-brand-700 dark:text-brand-400"
                @click.stop="emit('select', job.jobId)"
              >
                {{ job.jobId }}
              </button>
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ operationLabel(job.operationType) }}
            </td>
            <td class="px-4 py-4">
              <Badge :color="statusColor(job.status)">{{ statusLabel(job.status) }}</Badge>
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ job.sourceFileName ?? $t('common.emptyValue') }}
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ formatTimestamp(job.requestedAt) }}
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ progressText(job.progress) }}
            </td>
            <td v-if="showRetryColumn" class="px-4 py-4 text-right">
              <div v-if="canRetryJob(job)" @click.stop>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  :disabled="loading"
                  :loading="retryingJobId === job.jobId"
                  :onClick="() => emit('retry', job.jobId)"
                >
                  {{ $t('catalogImports.actions.retryJob') }}
                </Button>
              </div>
            </td>
          </tr>
          <tr v-if="jobs.length === 0">
            <td :colspan="showRetryColumn ? 7 : 6" class="px-5 py-12 text-center text-sm text-gray-500">
              {{ $t(props.emptyKey) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="border-t border-gray-200 px-5 py-4 dark:border-gray-800">
      <Pagination
        :currentPage="pagination.currentPage"
        :totalPages="pagination.totalPages"
        :pageSize="pagination.pageSize"
        :totalItems="pagination.totalItems"
        @pageChange="page => emit('pageChange', page)"
        @pageSizeChange="size => emit('pageSizeChange', size)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Badge, Button, Pagination, Spinner, type PaginationMetadata } from '@hivespace/shared'
import { useFormatDate } from '@hivespace/shared'
import { useI18n } from 'vue-i18n'
import type {
  CatalogImportJobHistoryRow,
  CatalogImportJobProgress,
  CatalogImportJobStatus,
  CatalogImportOperationType,
} from '@/types'

const props = withDefaults(
  defineProps<{
    jobs: CatalogImportJobHistoryRow[]
    pagination: PaginationMetadata
    loading?: boolean
    refreshLoading?: boolean
    retryingJobId?: string | null
    titleKey?: string
    descriptionKey?: string
    emptyKey?: string
  }>(),
  {
    loading: false,
    refreshLoading: false,
    retryingJobId: null,
    titleKey: 'catalogImports.sections.jobHistory',
    descriptionKey: 'catalogImports.jobs.historyDescription',
    emptyKey: 'catalogImports.empty.jobs',
  },
)

const emit = defineEmits<{
  select: [jobId: string]
  retry: [jobId: string]
  refresh: []
  pageChange: [page: number]
  pageSizeChange: [pageSize: number]
}>()

const { t } = useI18n()
const { formatDateTime, formatRelativeTime } = useFormatDate()

const statusLabel = (status: CatalogImportJobStatus) =>
  t(`catalogImports.statuses.${status}`, status)

const operationLabel = (operationType: CatalogImportOperationType) =>
  t(`catalogImports.operationTypes.${operationType}`, operationType)

const canRetryJob = (job: CatalogImportJobHistoryRow) => job.status === 'Failed'

const showRetryColumn = computed(
  () => props.jobs.some(canRetryJob) || Boolean(props.retryingJobId),
)

const statusColor = (status: CatalogImportJobStatus) => {
  if (status === 'Completed') return 'success'
  if (status === 'Failed') return 'error'
  if (status === 'Running') return 'warning'
  return 'info'
}

const progressText = (progress?: CatalogImportJobProgress | null) => {
  if (!progress) return t('common.emptyValue')
  return t('catalogImports.jobs.progressValue', {
    processed: progress.processed,
    total: progress.total,
  })
}

const formatTimestamp = (value?: string | null) => {
  if (!value) return t('common.emptyValue')

  return `${formatDateTime(value)} (${formatRelativeTime(value, { t })})`
}
</script>

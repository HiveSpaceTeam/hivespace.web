<template>
  <section class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
      <div>
        <h2 class="text-base font-semibold text-gray-900 dark:text-white">
          {{ $t('catalogImports.sections.bundleHistory') }}
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          {{ $t('catalogImports.bundles.historyDescription') }}
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

    <div v-if="loading && bundles.length === 0" class="p-8 text-center">
      <Spinner />
    </div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr
            class="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-400"
          >
            <th class="px-4 py-3">{{ $t('catalogImports.bundles.bundleId') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.jobs.sourceFileName') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.bundles.source') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.bundles.status') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.bundles.submittedAt') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.bundles.summary') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="bundle in bundles"
            :key="bundle.bundleId"
            class="cursor-pointer border-b border-gray-100 text-sm transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
            @click="emit('select', bundle)"
          >
            <td class="px-4 py-4 font-medium text-gray-900 dark:text-white">
              <button
                type="button"
                class="text-left text-brand-600 hover:text-brand-700 dark:text-brand-400"
                @click.stop="emit('select', bundle)"
              >
                {{ bundle.bundleId }}
              </button>
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ bundle.sourceFileName ?? $t('common.emptyValue') }}
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ bundle.source.type }}: {{ bundle.source.value }}
            </td>
            <td class="px-4 py-4">
              <Badge :color="statusColor(bundle.status)">
                {{ $t(`catalogImports.bundleStatuses.${bundle.status}`, bundle.status) }}
              </Badge>
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ formatTimestamp(bundle.submittedAt ?? bundle.crawl.completedAt) }}
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ summaryText(bundle) }}
            </td>
          </tr>
          <tr v-if="bundles.length === 0">
            <td colspan="6" class="px-5 py-12 text-center text-sm text-gray-500">
              {{ $t('catalogImports.empty.bundles') }}
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
import {
  Badge,
  Button,
  Pagination,
  Spinner,
  type PaginationMetadata,
  useFormatDate,
} from '@hivespace/shared'
import { useI18n } from 'vue-i18n'
import type { CatalogImportBundleSummary } from '@/types'

defineProps<{
  bundles: CatalogImportBundleSummary[]
  pagination: PaginationMetadata
  loading?: boolean
  refreshLoading?: boolean
}>()

const emit = defineEmits<{
  select: [bundle: CatalogImportBundleSummary]
  refresh: []
  pageChange: [page: number]
  pageSizeChange: [pageSize: number]
}>()

const { t } = useI18n()
const { formatDateTime, formatRelativeTime } = useFormatDate()

const statusColor = (status: string) => {
  if (status === 'Imported') return 'success'
  if (status === 'PartiallyImported') return 'warning'
  if (status === 'NeedsAttention') return 'warning'
  if (status === 'Validated') return 'info'
  return 'light'
}

const formatTimestamp = (value?: string | null) => {
  if (!value) return t('common.emptyValue')

  return `${formatDateTime(value)} (${formatRelativeTime(value, { t })})`
}

const summaryText = (bundle: CatalogImportBundleSummary) =>
  t('catalogImports.bundles.summaryValue', {
    ready: bundle.summary.readyProducts,
    blocked: bundle.summary.blockedProducts,
    warnings: bundle.summary.warningCount,
  })
</script>

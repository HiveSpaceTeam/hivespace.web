<template>
  <section class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
    <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
      <h2 class="text-base font-semibold text-gray-900 dark:text-white">
        {{ $t('catalogImports.sections.validationIssues') }}
      </h2>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr
            class="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-400"
          >
            <th class="px-4 py-3">{{ $t('catalogImports.issues.severity') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.issues.entity') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.issues.field') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.issues.reason') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="issue in issues"
            :key="issue.issueId ?? issue.reasonCode"
            class="border-b border-gray-100 text-sm transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
          >
            <td class="px-4 py-4">
              <Badge :color="issue.severity === 'Blocking' ? 'error' : 'warning'">
                {{ severityLabel(issue.severity) }}
              </Badge>
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ issue.entityType }} / {{ issue.entitySourceId }}
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ issue.field ?? $t('common.emptyValue') }}
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ issue.message ?? issue.reasonCode }}
            </td>
          </tr>
          <tr v-if="issues.length === 0">
            <td colspan="4" class="px-5 py-12 text-center text-sm text-gray-500">
              {{ $t('catalogImports.empty.validationIssues') }}
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
import { Badge, Pagination, type PaginationMetadata } from '@hivespace/shared'
import { useI18n } from 'vue-i18n'
import type { CatalogImportIssueSeverity, CatalogImportValidationIssue } from '@/types'

defineProps<{
  issues: CatalogImportValidationIssue[]
  pagination: PaginationMetadata
}>()

const emit = defineEmits<{
  pageChange: [page: number]
  pageSizeChange: [pageSize: number]
}>()

const { t } = useI18n()

const severityLabel = (severity: CatalogImportIssueSeverity) =>
  t(`catalogImports.severity.${severity.toLowerCase()}`, severity)
</script>

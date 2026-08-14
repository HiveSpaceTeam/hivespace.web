<template>
  <section class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
    <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
      <h2 class="text-base font-semibold text-gray-900 dark:text-white">
        {{ $t('catalogImports.sections.duplicates') }}
      </h2>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr
            class="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-400"
          >
            <th class="px-4 py-3">{{ $t('catalogImports.duplicates.group') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.duplicates.products') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.duplicates.reason') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="group in duplicateGroups"
            :key="group.groupId"
            class="border-b border-gray-100 text-sm transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
          >
            <td class="px-4 py-4 font-medium text-gray-900 dark:text-white">
              {{ group.groupId }}
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ group.externalProductIds.join(', ') }}
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ group.reasonCode }}
            </td>
          </tr>
          <tr v-if="duplicateGroups.length === 0">
            <td colspan="3" class="px-5 py-12 text-center text-sm text-gray-500">
              {{ $t('catalogImports.empty.duplicates') }}
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
import { Pagination, type PaginationMetadata } from '@hivespace/shared'
import type { CatalogImportDuplicateGroup } from '@/types'

defineProps<{
  duplicateGroups: CatalogImportDuplicateGroup[]
  pagination: PaginationMetadata
}>()

const emit = defineEmits<{
  pageChange: [page: number]
  pageSizeChange: [pageSize: number]
}>()
</script>

<template>
  <section class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
    <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
      <h2 class="text-base font-semibold text-gray-900 dark:text-white">
        {{ $t('catalogImports.sections.sellers') }}
      </h2>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr
            class="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-400"
          >
            <th class="px-4 py-3">{{ $t('catalogImports.sellers.name') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.sellers.externalId') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.sellers.status') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.sellers.ownership') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.actions.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="seller in sellers"
            :key="seller.importedSellerId ?? seller.externalSellerId"
            class="border-b border-gray-100 text-sm transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
          >
            <td class="px-4 py-4 font-medium text-gray-900 dark:text-white">
              {{ seller.displayName }}
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ seller.externalSellerId }}
            </td>
            <td class="px-4 py-4">
              <Badge :color="seller.status === 'Conflict' || seller.status === 'Failed' ? 'error' : 'info'">
                {{ seller.status ?? $t('catalogImports.sellers.pending') }}
              </Badge>
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              <p>{{ seller.storeId ?? seller.userId ?? $t('common.emptyValue') }}</p>
              <p v-if="seller.conflictReason" class="mt-1 text-xs text-error-500">
                {{ $t('catalogImports.sellers.conflictReason') }}: {{ seller.conflictReason }}
              </p>
              <ul v-if="seller.existingStoreCandidates?.length" class="mt-2 space-y-1 text-xs">
                <li v-for="candidate in seller.existingStoreCandidates" :key="candidate.storeId">
                  {{ candidate.storeName }} - {{ candidate.storeId }}
                </li>
              </ul>
            </td>
            <td class="px-4 py-4">
              <Button
                v-if="seller.status === 'Conflict' && seller.existingStoreCandidates?.length"
                type="button"
                variant="outline"
                size="sm"
                :disabled="disabled"
                :loading="loadingSellerId === (seller.importedSellerId ?? seller.externalSellerId)"
                :onClick="() => emit('approve', seller)"
              >
                {{ $t('catalogImports.actions.approveSellerOwnership') }}
              </Button>
            </td>
          </tr>
          <tr v-if="sellers.length === 0">
            <td colspan="5" class="px-5 py-12 text-center text-sm text-gray-500">
              {{ $t('catalogImports.empty.sellers') }}
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
import { Badge, Button, Pagination, type PaginationMetadata } from '@hivespace/shared'
import type { ImportedSeller } from '@/types'

defineProps<{
  sellers: ImportedSeller[]
  pagination: PaginationMetadata
  disabled?: boolean
  loadingSellerId?: string | null
}>()

const emit = defineEmits<{
  approve: [seller: ImportedSeller]
  pageChange: [page: number]
  pageSizeChange: [pageSize: number]
}>()
</script>

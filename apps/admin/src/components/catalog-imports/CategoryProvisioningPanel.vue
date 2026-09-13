<template>
  <section class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
    <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-gray-900 dark:text-white">
            {{ $t('catalogImports.sections.categoryLinks') }}
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            {{ $t('catalogImports.categories.linksDescription') }}
          </p>
        </div>
        <div class="w-full max-w-md">
          <Input
            :modelValue="searchTerm"
            :label="$t('catalogImports.search.categoryLinksLabel')"
            :placeholder="$t('catalogImports.search.categoryLinksPlaceholder')"
            type="search"
            @update:modelValue="value => emit('update:searchTerm', value)"
          />
        </div>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr
            class="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-400"
          >
            <th class="px-4 py-3">{{ $t('catalogImports.categories.externalId') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.categories.hiveSpaceCategory') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.categories.status') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.categories.conflictReason') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="link in categoryLinks"
            :key="link.externalCategoryId"
            class="border-b border-gray-100 text-sm transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
          >
            <td class="px-4 py-4 font-medium text-gray-900 dark:text-white">
              {{ link.externalCategoryId }}
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ link.categoryName ?? link.categoryId ?? $t('common.emptyValue') }}
            </td>
            <td class="px-4 py-4">
              <Badge :color="link.status === 'Conflict' || link.status === 'Failed' ? 'error' : 'info'">
                {{ categoryStatusLabel(link.status) }}
              </Badge>
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ link.conflictReason ?? $t('common.emptyValue') }}
            </td>
          </tr>
          <tr v-if="categoryLinks.length === 0">
            <td colspan="4" class="px-5 py-12 text-center text-sm text-gray-500">
              {{
                hasSearchTerm
                  ? $t('catalogImports.empty.categoryLinksSearch')
                  : $t('catalogImports.empty.categoryLinks')
              }}
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
import { Badge, Input, Pagination, type PaginationMetadata } from '@hivespace/shared'
import { useI18n } from 'vue-i18n'
import type { ProvisionedCategoryLink } from '@/types'

const props = withDefaults(
  defineProps<{
    categoryLinks: ProvisionedCategoryLink[]
    pagination: PaginationMetadata
    searchTerm?: string
  }>(),
  {
    searchTerm: '',
  },
)

const { t } = useI18n()
const hasSearchTerm = computed(() => props.searchTerm.trim().length > 0)

const emit = defineEmits<{
  'update:searchTerm': [searchTerm: string]
  pageChange: [page: number]
  pageSizeChange: [pageSize: number]
}>()

const categoryStatusLabel = (status: string) =>
  t(`catalogImports.categories.statuses.${status}`, status)
</script>

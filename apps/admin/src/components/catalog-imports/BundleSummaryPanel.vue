<template>
  <section class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="text-xs uppercase text-gray-500">{{ $t('catalogImports.summary.bundleId') }}</p>
        <h2 class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
          {{ bundle.bundleId }}
        </h2>
      </div>
      <Badge :color="statusColor(bundle.status)">
        {{ $t(`catalogImports.bundleStatuses.${bundle.status}`, bundle.status) }}
      </Badge>
    </div>

    <dl class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <div
        v-for="item in summaryItems"
        :key="item.key"
        class="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
      >
        <dt class="text-xs text-gray-500">{{ $t(item.labelKey) }}</dt>
        <dd class="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
          {{ item.value }}
        </dd>
      </div>
    </dl>

    <dl class="mt-5 grid gap-3 text-sm text-gray-600 dark:text-gray-300 md:grid-cols-4">
      <div>
        <dt class="text-xs uppercase text-gray-500">{{ $t('catalogImports.source.type') }}</dt>
        <dd class="mt-1">{{ bundle.source.type }}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase text-gray-500">{{ $t('catalogImports.source.value') }}</dt>
        <dd class="mt-1">{{ bundle.source.value }}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase text-gray-500">
          {{ $t('catalogImports.jobs.sourceFileName') }}
        </dt>
        <dd class="mt-1">{{ bundle.sourceFileName ?? $t('common.emptyValue') }}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase text-gray-500">
          {{ $t('catalogImports.source.completedAt') }}
        </dt>
        <dd class="mt-1">{{ bundle.crawl.completedAt }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@hivespace/shared'
import type { CatalogImportBundleSummary } from '@/types'

const props = defineProps<{
  bundle: CatalogImportBundleSummary
}>()

const statusColor = (status: string) => {
  if (status === 'Imported') return 'success'
  if (status === 'PartiallyImported') return 'warning'
  if (status === 'NeedsAttention') return 'warning'
  if (status === 'Validated' || status === 'ReadyToImport') return 'info'
  return 'light'
}

const summaryItems = computed(() => [
  {
    key: 'totalProducts',
    labelKey: 'catalogImports.summary.totalProducts',
    value: props.bundle.summary.totalProducts,
  },
  {
    key: 'readyProducts',
    labelKey: 'catalogImports.summary.readyProducts',
    value: props.bundle.summary.readyProducts,
  },
  {
    key: 'blockedProducts',
    labelKey: 'catalogImports.summary.blockedProducts',
    value: props.bundle.summary.blockedProducts,
  },
  {
    key: 'warningCount',
    labelKey: 'catalogImports.summary.warningCount',
    value: props.bundle.summary.warningCount,
  },
  {
    key: 'duplicateCount',
    labelKey: 'catalogImports.summary.duplicateCount',
    value: props.bundle.summary.duplicateCount,
  },
])
</script>

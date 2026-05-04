<template>
  <div class="flex items-start gap-3">
    <div
      class="h-14 w-14 flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
    >
      <img
        v-if="item.productImageUrl"
        :src="item.productImageUrl"
        :alt="item.productName"
        class="h-full w-full object-cover"
      />
      <div v-else class="flex h-full w-full items-center justify-center">
        <svg class="h-6 w-6 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>

    <div class="min-w-0 flex-1">
      <Badge v-if="item.tag" size="sm" color="error" class="mb-0.5">
        {{ item.tag }}
      </Badge>
      <p class="line-clamp-2 text-sm leading-snug text-gray-800 dark:text-gray-200">
        {{ item.productName }}
      </p>
      <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
        {{
          item.variation
            ? $t('order.table.variation', { value: item.variation })
            : $t('order.table.noVariation')
        }}
      </p>
    </div>

    <span class="ml-2 flex-shrink-0 text-sm text-gray-600 dark:text-gray-400">
      x{{ item.quantity }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@hivespace/shared'
import type { OrderItem } from '@/types'

defineProps<{
  item: OrderItem
}>()
</script>

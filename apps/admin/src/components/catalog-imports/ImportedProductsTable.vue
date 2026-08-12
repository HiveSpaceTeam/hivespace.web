<template>
  <section class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
    <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
      <h2 class="text-base font-semibold text-gray-900 dark:text-white">
        {{ $t('catalogImports.sections.products') }}
      </h2>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr
            class="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-400"
          >
            <th v-if="selectable" class="w-14 px-4 py-3">
              <Checkbox
                :modelValue="allSelectableOnPageSelected"
                :disabled="disabled || selectableProductIds.length === 0"
                :label="$t('catalogImports.products.selectProduct')"
                class="[&>div>div]:mr-0 [&>span:last-child]:hidden"
                @update:modelValue="toggleAllSelectable"
              />
            </th>
            <th class="px-4 py-3">{{ $t('catalogImports.products.product') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.products.seller') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.products.categories') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.products.skus') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.products.price') }}</th>
            <th class="px-4 py-3">{{ $t('catalogImports.products.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in products"
            :key="product.productId"
            class="border-b border-gray-100 text-sm transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
          >
            <td v-if="selectable" class="px-4 py-4">
              <Checkbox
                :modelValue="selectedProductIds.includes(product.productId)"
                :disabled="disabled || !isSelectable(product)"
                :label="$t('catalogImports.products.selectProduct')"
                class="[&>div>div]:mr-0 [&>span:last-child]:hidden"
                @update:modelValue="checked => toggleProduct(product.productId, checked)"
              />
            </td>
            <td class="px-4 py-4 font-medium text-gray-900 dark:text-white">
              <p>{{ product.title }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ product.externalProductId }}</p>
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ product.externalSellerId }}
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ product.externalCategoryIds?.join(', ') || $t('common.emptyValue') }}
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ product.skus?.length ?? 0 }}
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ firstSkuPrice(product) }}
            </td>
            <td class="px-4 py-4">
              <Badge :color="getStatusColor(product.readinessStatus)">
                {{ product.readinessStatus }}
              </Badge>
            </td>
          </tr>
          <tr v-if="products.length === 0">
            <td :colspan="selectable ? 7 : 6" class="px-5 py-12 text-center text-sm text-gray-500">
              {{ $t('catalogImports.empty.products') }}
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
import {
  Badge,
  Checkbox,
  Pagination,
  type PaginationMetadata,
  useMoneyFormatter,
} from '@hivespace/shared'
import type { ImportedProduct } from '@/types'

const props = withDefaults(
  defineProps<{
    products: ImportedProduct[]
    pagination: PaginationMetadata
    selectedProductIds?: string[]
    selectable?: boolean
    disabled?: boolean
  }>(),
  {
    selectedProductIds: () => [],
    selectable: false,
  },
)

const emit = defineEmits<{
  'update:selectedProductIds': [productIds: string[]]
  pageChange: [page: number]
  pageSizeChange: [pageSize: number]
}>()

const { formatMoney } = useMoneyFormatter()

const isSelectable = (product: ImportedProduct) =>
  product.readinessStatus === 'Ready' || product.readinessStatus === 'Warning'

const selectableProductIds = computed(() =>
  props.products.filter(product => isSelectable(product)).map(product => product.productId),
)

const allSelectableOnPageSelected = computed(
  () =>
    selectableProductIds.value.length > 0 &&
    selectableProductIds.value.every(productId => props.selectedProductIds.includes(productId)),
)

const firstSkuPrice = (product: ImportedProduct) => {
  const price = product.skus?.[0]?.price
  if (!price) return ''
  return formatMoney(price)
}

const getStatusColor = (status: ImportedProduct['readinessStatus']) => {
  if (status === 'Blocked') return 'error'
  if (status === 'Warning') return 'warning'
  return 'info'
}

const emitSelectedProducts = (productIds: string[]) => {
  emit('update:selectedProductIds', [...new Set(productIds)])
}

const toggleProduct = (productId: string, checked: boolean) => {
  const next = checked
    ? [...props.selectedProductIds, productId]
    : props.selectedProductIds.filter(id => id !== productId)

  emitSelectedProducts(next)
}

const toggleAllSelectable = (checked: boolean) => {
  if (!checked) {
    emitSelectedProducts(
      props.selectedProductIds.filter(productId => !selectableProductIds.value.includes(productId)),
    )
    return
  }

  emitSelectedProducts([...props.selectedProductIds, ...selectableProductIds.value])
}
</script>

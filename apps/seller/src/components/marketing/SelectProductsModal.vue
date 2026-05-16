<template>
  <div class="flex flex-col -mx-6 -mb-6">
    <div class="px-6 border-b border-gray-100 dark:border-gray-800">
      <Tabs v-model="activeTab" :options="tabOptions" variant="default" />
    </div>

    <div v-if="activeTab === 'select'" class="flex-1 p-6 space-y-6">
      <!-- Filters -->
      <div class="flex flex-col gap-4">
        <!-- Filter Row 1 -->
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">{{
              $t('coupon.detail.selectProductsModal.category')
              }}</label>
            <div class="w-48">
              <Select v-model="filters.category" :options="categoryOptions" />
            </div>
          </div>
          <div class="flex items-center gap-2 flex-1">
            <label class="text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">{{
              $t('coupon.detail.selectProductsModal.search')
              }}</label>
            <div class="flex items-center gap-2 flex-1">
              <div class="w-40">
                <Select v-model="filters.searchType" :options="searchTypeOptions" />
              </div>
              <Input v-model="filters.searchQuery" type="text" class="flex-1" />
            </div>
          </div>
        </div>

        <!-- Filter Row 2 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Button variant="primary" size="sm" @click="handleSearch">{{
              $t('coupon.detail.selectProductsModal.searchBtn')
              }}</Button>
            <Button variant="outline" size="sm" @click="handleReset">{{
              $t('coupon.detail.selectProductsModal.resetBtn')
              }}</Button>
          </div>
          <div class="flex items-center h-full">
            <Checkbox v-model="filters.showAvailableOnly"
              :label="$t('coupon.detail.selectProductsModal.showAvailableOnly')" id="show-available-only" />
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto w-full custom-scrollbar">
        <table class="w-full text-left" style="min-width: 600px">
          <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-4 py-3 w-12 align-middle">
                <Checkbox :model-value="selectAll" @change="toggleSelectAll" id="select-all" />
              </th>
              <th class="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {{ $t('coupon.detail.selectProductsModal.table.products') }}
              </th>
              <th class="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-24 whitespace-nowrap">
                <button @click="handleSort('sales')"
                  class="flex items-center gap-1 cursor-pointer font-medium hover:text-gray-700 dark:hover:text-gray-300">
                  {{ $t('coupon.detail.selectProductsModal.table.sales') }}
                  <component :is="getSortIcon('sales')" class="w-4 h-4 text-gray-500" />
                </button>
              </th>
              <th class="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-32 whitespace-nowrap">
                <button @click="handleSort('price')"
                  class="flex items-center gap-1 cursor-pointer font-medium hover:text-gray-700 dark:hover:text-gray-300">
                  {{ $t('coupon.detail.selectProductsModal.table.price') }}
                  <component :is="getSortIcon('price')" class="w-4 h-4 text-gray-500" />
                </button>
              </th>
              <th class="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-24 whitespace-nowrap">
                <button @click="handleSort('stock')"
                  class="flex items-center gap-1 cursor-pointer font-medium hover:text-gray-700 dark:hover:text-gray-300">
                  {{ $t('coupon.detail.selectProductsModal.table.stock') }}
                  <component :is="getSortIcon('stock')" class="w-4 h-4 text-gray-500" />
                  <span
                    class="text-xs ml-1 inline-flex items-center justify-center w-3 h-3 rounded-full border border-gray-400 text-gray-400 hover:text-gray-600 cursor-help"
                    title="Available stock">?</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            <tr v-if="isFetchingProducts">
              <td colspan="5" class="px-4 py-8 text-center">
                <Spinner size="md" />
              </td>
            </tr>
            <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-4 py-4 w-12 align-top">
                <Checkbox :model-value="selectedProducts.includes(product.id)" @change="toggleProduct(product.id)"
                  :id="`prod-${product.id}`" />
              </td>
              <td class="px-4 py-4 min-w-[200px]">
                <div class="flex items-start gap-3">
                  <img :src="product.image || ''"
                    class="w-10 h-10 rounded bg-gray-100 object-cover border border-gray-200 dark:border-gray-700 shrink-0" />
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ product.name }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      ID: {{ product.id }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 align-top text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {{ product.salesLabel }}
              </td>
              <td class="px-4 py-4 align-top text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {{ formatPrice(product.priceMin, product.priceMax) }}
              </td>
              <td class="px-4 py-4 align-top text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {{ product.stock }}
              </td>
            </tr>
            <!-- Empty State -->
            <tr v-if="!isFetchingProducts && products.length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                {{ $t('coupon.detail.selectProductsModal.noProductsFound') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="shouldShowPagination"
        class="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3"
      >
        <Pagination
          :currentPage="page"
          :totalPages="pagination?.totalPages ?? 1"
          :pageSize="PRODUCT_PAGE_SIZE"
          :totalItems="pagination?.totalItems ?? 0"
          :pageSizeOptions="[10]"
          @update:currentPage="handlePageChange"
        />
      </div>
    </div>

    <!-- Upload Tab content placeholder -->
    <div v-if="activeTab === 'upload'" class="flex-1 p-6 flex items-center justify-center text-gray-500 min-h-[400px]">
      {{ $t('coupon.detail.selectProductsModal.uploadComingSoon') }}
    </div>

    <!-- Footer -->
    <div class="px-6 py-4 flex justify-end gap-3 rounded-b-xl shrink-0">
      <Button variant="outline" @click="closeModal(null)">{{
        $t('coupon.detail.selectProductsModal.cancel')
        }}</Button>
      <Button variant="primary" @click="handleConfirm">{{
        $t('coupon.detail.selectProductsModal.confirm')
        }}</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import {
  Button,
  Input,
  Select,
  Checkbox,
  Tabs,
  SortIcon,
  SortAscIcon,
  SortDescIcon,
  Spinner,
  Pagination,
  useModal,
} from '@hivespace/shared'
import type { Product } from '@/types'
import { useProductStore } from '@/stores/product.store'

const { t } = useI18n()
const productStore = useProductStore()
const {
  products: storeProducts,
  categories,
  pagination,
  isFetchingProducts,
} = storeToRefs(productStore)

const props = defineProps<{
  alreadySelected?: number[]
}>()

const { closeModal } = useModal()
type SelectProductsModalResult = number[] | null

const activeTab = ref('select')

const tabOptions = computed(() => [
  { label: t('coupon.detail.selectProductsModal.tabs.select'), value: 'select' },
  { label: t('coupon.detail.selectProductsModal.tabs.upload'), value: 'upload' },
])

const filters = ref({
  category: 'all',
  searchType: 'name',
  searchQuery: '',
  showAvailableOnly: true,
})

const categoryOptions = computed(() => [
  { label: t('coupon.detail.selectProductsModal.allCategories'), value: 'all' },
  ...categories.value.map((category) => ({
    label: category.displayName,
    value: category.name,
  })),
])

const searchTypeOptions = computed(() => [
  { label: t('coupon.detail.selectProductsModal.searchProductName'), value: 'name' },
])

type CouponSelectableProduct = {
  id: number
  name: string
  image: string | null
  category: string
  sales: number
  salesLabel: string
  priceMin: number
  priceMax: number
  stock: number
}

const PRODUCT_PAGE_SIZE = 10
const page = ref(1)

const toNumber = (value: number | string | undefined): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const mapProduct = (product: Product): CouponSelectableProduct | null => {
  if (typeof product.id !== 'number') return null

  const prices = product.skus
    .map((sku) => Number(sku.price?.amount ?? 0))
    .filter((price) => Number.isFinite(price))
  const priceMin = prices.length > 0 ? Math.min(...prices) : 0
  const priceMax = prices.length > 0 ? Math.max(...prices) : 0
  const stock = product.skus.reduce((sum, sku) => sum + toNumber(sku.quantity), 0)

  return {
    id: product.id,
    name: product.name,
    image: product.thumbnailUrl,
    category: product.category,
    sales: 0,
    salesLabel: '-',
    priceMin,
    priceMax,
    stock,
  }
}

const products = computed<CouponSelectableProduct[]>(() => {
  let mappedProducts = storeProducts.value
    .map(mapProduct)
    .filter((product): product is CouponSelectableProduct => product !== null)

  if (filters.value.category !== 'all') {
    mappedProducts = mappedProducts.filter((product) => product.category === filters.value.category)
  }

  if (filters.value.showAvailableOnly) {
    mappedProducts = mappedProducts.filter((product) => product.stock > 0)
  }

  if (currentSort.value && sortDirection.value) {
    const direction = sortDirection.value === 'asc' ? 1 : -1

    mappedProducts = [...mappedProducts].sort((left, right) => {
      const leftValue = currentSort.value === 'price'
        ? left.priceMin
        : currentSort.value === 'stock'
          ? left.stock
          : left.sales
      const rightValue = currentSort.value === 'price'
        ? right.priceMin
        : currentSort.value === 'stock'
          ? right.stock
          : right.sales

      return (leftValue - rightValue) * direction
    })
  }

  return mappedProducts
})

const selectedProducts = ref<number[]>(props.alreadySelected ? [...props.alreadySelected] : [])
const shouldShowPagination = computed(() => {
  if (!pagination.value) return false
  return pagination.value.hasNextPage || pagination.value.totalPages > 1
})

const selectAll = computed(() => {
  return products.value.length > 0 && products.value.every((product) => selectedProducts.value.includes(product.id))
})

const toggleSelectAll = (checked: boolean) => {
  const nextSelection = new Set(selectedProducts.value)

  if (checked) {
    products.value.forEach((product) => nextSelection.add(product.id))
  } else {
    products.value.forEach((product) => nextSelection.delete(product.id))
  }

  selectedProducts.value = [...nextSelection]
}

const toggleProduct = (id: number) => {
  const index = selectedProducts.value.indexOf(id)
  if (index > -1) {
    selectedProducts.value.splice(index, 1)
  } else {
    selectedProducts.value.push(id)
  }
}

const formatPrice = (min: number, max: number) => {
  if (min === max) return `₫${min}`
  return `₫${min}-₫${max}`
}

// Sorting logic
const currentSort = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

const handleSort = (field: string) => {
  if (currentSort.value === field) {
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
    } else if (sortDirection.value === 'desc') {
      currentSort.value = null
      sortDirection.value = null
    } else {
      sortDirection.value = 'asc'
    }
  } else {
    currentSort.value = field
    sortDirection.value = 'asc'
  }
}

const getSortIcon = (field: string) => {
  if (currentSort.value !== field) return SortIcon
  return sortDirection.value === 'asc' ? SortAscIcon : SortDescIcon
}

const loadProducts = async (
  keyword = filters.value.searchQuery.trim(),
  targetPage = page.value,
) => {
  const result = await productStore.fetchProducts({
    page: targetPage,
    pageSize: PRODUCT_PAGE_SIZE,
    sort: 'ASC',
    keyword: keyword || undefined,
  })

  page.value = result.pagination.currentPage
}

const handleSearch = async () => {
  page.value = 1
  await loadProducts()
}

const handleReset = async () => {
  filters.value.category = 'all'
  filters.value.searchType = 'name'
  filters.value.searchQuery = ''
  filters.value.showAvailableOnly = true
  page.value = 1
  await loadProducts('')
}

const handlePageChange = async (nextPage: number) => {
  page.value = nextPage
  await loadProducts(filters.value.searchQuery.trim(), nextPage)
}

const handleConfirm = () => {
  closeModal<SelectProductsModalResult>(selectedProducts.value)
}

onMounted(async () => {
  await Promise.all([
    productStore.fetchCategories(),
    loadProducts(),
  ])
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 20px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}
</style>

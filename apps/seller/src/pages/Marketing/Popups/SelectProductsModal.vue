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
            <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-4 py-4 w-12 align-top">
                <Checkbox :model-value="selectedProducts.includes(product.id)" @change="toggleProduct(product.id)"
                  :id="`prod-${product.id}`" />
              </td>
              <td class="px-4 py-4 min-w-[200px]">
                <div class="flex items-start gap-3">
                  <img :src="product.image"
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
                {{ product.sales }}
              </td>
              <td class="px-4 py-4 align-top text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {{ formatPrice(product.priceMin, product.priceMax) }}
              </td>
              <td class="px-4 py-4 align-top text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {{ product.stock }}
              </td>
            </tr>
            <!-- Empty State -->
            <tr v-if="products.length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No products found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Upload Tab content placeholder -->
    <div v-if="activeTab === 'upload'" class="flex-1 p-6 flex items-center justify-center text-gray-500 min-h-[400px]">
      Upload Product List feature coming soon.
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
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button, Input, Select, Checkbox, Tabs, SortIcon, SortAscIcon, SortDescIcon, useModal } from '@hivespace/shared'

const { t } = useI18n()

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
  // Add more category options here
])

const searchTypeOptions = computed(() => [
  { label: t('coupon.detail.selectProductsModal.searchProductName'), value: 'name' },
])

// Mock data based on the screenshot requirements
const originalProducts = [
  {
    id: 56900158122,
    name: 'xvsdthne5r7jne',
    image: '', // Will fallback or show broken img frame on mockup
    sales: 0,
    priceMin: 1000,
    priceMax: 1000,
    stock: 48,
  },
  {
    id: 29717641908,
    name: 'Computers & Accessories',
    image: '',
    sales: 0,
    priceMin: 1000,
    priceMax: 2000,
    stock: 42,
  },
  {
    id: 29268188867,
    name: 'Computers & AccessoriesComputers & ...',
    image: '',
    sales: 0,
    priceMin: 1000000,
    priceMax: 1000000,
    stock: 123,
  },
]

const products = ref([...originalProducts])

const selectedProducts = ref<number[]>(props.alreadySelected ? [...props.alreadySelected] : [])

const selectAll = computed(() => {
  return products.value.length > 0 && selectedProducts.value.length === products.value.length
})

const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedProducts.value = products.value.map((p) => p.id)
  } else {
    selectedProducts.value = []
  }
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
    // Same field: cycle through asc -> desc -> none
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
    } else if (sortDirection.value === 'desc') {
      currentSort.value = null
      sortDirection.value = null
    } else {
      sortDirection.value = 'asc'
    }
  } else {
    // Different field: start with asc
    currentSort.value = field
    sortDirection.value = 'asc'
  }

  // Trigger local sort (Mock data so manual array sort instead of load API)
  if (!currentSort.value || !sortDirection.value) {
    // Original unsorted order
    products.value = [...originalProducts]
    return
  }
}

const getSortIcon = (field: string) => {
  if (currentSort.value !== field) return SortIcon
  return sortDirection.value === 'asc' ? SortAscIcon : SortDescIcon
}

const handleSearch = () => {
  // Execute search logic based on filters.value
  console.log('Searching with: ', filters.value)
}

const handleReset = () => {
  filters.value.category = 'all'
  filters.value.searchType = 'name'
  filters.value.searchQuery = ''
  filters.value.showAvailableOnly = true
}

const handleConfirm = () => {
  closeModal<SelectProductsModalResult>(selectedProducts.value)
}
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

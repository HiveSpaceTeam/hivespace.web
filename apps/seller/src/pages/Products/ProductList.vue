<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard :title="$t('pages.productList')">
        <div
          class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3"
        >
          <div class="border-b border-gray-200 p-4 dark:border-gray-700">
            <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div class="flex items-center justify-end gap-2">
                <div class="w-full sm:w-64">
                  <Input
                    type="text"
                    :value="searchQuery"
                    :placeholder="$t('product.searchPlaceholder')"
                    autocomplete="off"
                    @input="tableHandleSearchInput"
                  />
                </div>

                <div class="sm:w-48">
                  <Select
                    v-model="statusFilter"
                    :options="statusOptions"
                    :buttonClass="'w-full text-left px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white flex justify-between items-center'"
                  />
                </div>
              </div>

              <div class="flex items-center justify-end">
                <div class="flex items-center gap-2">
                  <Button :onClick="addNewProduct" :startIcon="BigPlusIcon" variant="primary">
                    {{ $t('product.addProduct') }}
                  </Button>
                  <Button :startIcon="RefreshIcon" variant="outline" @click="refreshTables">
                    {{ $t('common.actions.refresh') }}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="loading" class="p-8 text-center">
            <Spinner />
            <p class="mt-2 text-gray-600 dark:text-gray-400">{{ $t('table.loading') }}</p>
          </div>

          <div v-else class="max-w-full overflow-x-auto custom-scrollbar">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="w-1/3 px-5 py-3 text-left sm:px-6">
                    <p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      {{ $t('product.productName') }}
                    </p>
                  </th>
                  <th class="w-1/3 px-5 py-3 text-left sm:px-6">
                    <p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      {{ $t('product.price') }}
                    </p>
                  </th>
                  <th class="w-1/3 px-5 py-3 text-left sm:px-6">
                    <p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      {{ $t('product.quantity') }}
                    </p>
                  </th>
                  <th class="w-1/4 px-5 py-3 text-left sm:px-6">
                    <p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      {{ $t('common.action') }}
                    </p>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="product in products"
                  :key="product.id"
                  class="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
                >
                  <td class="px-5 py-4 sm:px-6">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ product.name }}
                    </div>
                  </td>
                  <td class="px-5 py-4 sm:px-6">
                    <div class="text-sm text-gray-900 dark:text-white">
                      {{ formatPriceRange(product) }}
                    </div>
                  </td>
                  <td class="px-5 py-4 sm:px-6">
                    <div class="text-sm text-gray-900 dark:text-white">
                      {{ totalQuantity(product) }}
                    </div>
                  </td>
                  <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center gap-2">
                      <Button :startIcon="EditIcon" variant="outline" @click="editProduct(product)" />
                      <Button
                        :startIcon="TrashRedIcon"
                        variant="outline"
                        @click="removeProduct(product)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="!loading"
            class="flex flex-col items-center justify-between p-4 text-sm text-gray-600 dark:text-gray-400 sm:flex-row"
          >
            <div>
              {{ t('pages.common.showing') }} {{ startItem }} - {{ endItem }}
              {{ t('pages.common.of') }} {{ totalCount }}
            </div>
            <div class="mt-2 flex items-center gap-2 sm:mt-0">
              <Button variant="outline" :disabled="page === 1" @click="prevPage">
                {{ t('pages.common.prev') }}
              </Button>
              <Button variant="outline" :disabled="page >= totalPages" @click="nextPage">
                {{ t('pages.common.next') }}
              </Button>
            </div>
          </div>
        </div>
        <template #footer></template>
      </ComponentCard>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  AppShell,
  Button,
  Select,
  Input,
  PageBreadcrumb,
  ComponentCard,
  Spinner,
  useConfirmModal,
  useAppStore,
  BigPlusIcon,
  EditIcon,
  RefreshIcon,
  TrashRedIcon,
} from '@hivespace/shared'
import { useProductStore } from '@/stores'
import type { GetProductListQuery, Product } from '@/types'

const { t } = useI18n()
const router = useRouter()
const appStore = useAppStore()
const productStore = useProductStore()
const { products, pagination, isFetchingProducts, isMutatingProduct } = storeToRefs(productStore)
const { deleteConfirm } = useConfirmModal()

const currentPageTitle = computed(() => t('pages.productList'))
const statusOptions = computed(() => [
  { value: 'all', label: t('product.productStatus.allStatus') },
  { value: 'active', label: t('product.productStatus.active') },
  { value: 'inactive', label: t('product.productStatus.inactive') },
])

const searchQuery = ref('')
const statusFilter = ref('all')
const page = ref(1)
const pageSize = ref(10)

const loading = computed(() => isFetchingProducts.value || isMutatingProduct.value)
const totalCount = computed(() => pagination.value?.totalItems ?? 0)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value) || 1)
const startItem = computed(() => {
  if (totalCount.value === 0) return 0
  return (page.value - 1) * pageSize.value + 1
})
const endItem = computed(() => Math.min(page.value * pageSize.value, totalCount.value))

const totalQuantity = (product: Product): number => {
  if (!product?.skus?.length) return 0
  return product.skus.reduce((sum, sku) => {
    const quantity = typeof sku.quantity === 'string' ? Number(sku.quantity) : sku.quantity || 0
    return sum + (Number.isNaN(quantity) ? 0 : quantity)
  }, 0)
}

const formatPriceRange = (product: Product): string => {
  if (!product?.skus?.length) return '-'

  const prices: number[] = []
  for (const sku of product.skus) {
    const price = sku.price
    if (price == null) continue
    if (typeof price === 'number') {
      prices.push(price)
    } else if (typeof price === 'string') {
      const parsed = Number(price)
      if (!Number.isNaN(parsed)) prices.push(parsed)
    } else if (typeof price === 'object' && typeof price.amount === 'number') {
      prices.push(price.amount)
    }
  }

  if (!prices.length) return '-'

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  if (min === max) return formatCurrency(min)
  return `${formatCurrency(min)} - ${formatCurrency(max)}`
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value)
}

const fetchProducts = async () => {
  const params: GetProductListQuery = {
    keyword: searchQuery.value || undefined,
    sort: 'ASC',
    page: page.value,
    pageSize: pageSize.value,
  }

  try {
    const result = await productStore.fetchProducts(params)
    page.value = result.pagination.currentPage
    pageSize.value = result.pagination.pageSize
  } catch (error) {
    console.error('Failed to fetch products', error)
  }
}

const tableHandleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
  page.value = 1
  void fetchProducts()
}

const editProduct = (product: Product) => {
  if (!product?.id) return
  router.push({ path: `/product/${product.id}` })
}

const removeProduct = async (product: Product) => {
  if (!product?.id) return

  try {
    const confirmed = await deleteConfirm(
      t('product.deleteProduct'),
      t('product.deleteProductConfirm', { name: product.name }),
    )

    if (!confirmed) return

    await productStore.deleteProduct(String(product.id))
    appStore.notifySuccess(
      t('product.productDeleted'),
      t('product.productDeletedMessage', { name: product.name }),
    )
  } catch (error) {
    console.error('Failed to delete product:', error)
    appStore.notifyError(t('product.deleteError'), t('product.deleteErrorMessage'))
  }
}

const refreshTables = async () => {
  await fetchProducts()
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    void fetchProducts()
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
    void fetchProducts()
  }
}

const addNewProduct = () => {
  router.push({ path: '/product/new' })
}

onMounted(async () => {
  await fetchProducts()
})
</script>

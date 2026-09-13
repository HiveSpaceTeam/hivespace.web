<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="$t('catalogImports.detail.title')">
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ $t('catalogImports.detail.description') }}
      </p>
    </PageBreadcrumb>

    <div class="space-y-5">
      <div class="flex items-center">
        <RouterLink :to="catalogImportsRoute" :aria-label="$t('catalogImports.actions.backToList')"
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white">
          <BackArrowIcon class="h-4 w-4" />
        </RouterLink>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-3">
        <Button v-if="canRetrySelectedJob" type="button" variant="outline" size="sm"
          :loading="activeAction === 'retryJob'" :onClick="handleRetryJob">
          {{ $t('catalogImports.actions.retryJob') }}
        </Button>
        <Button type="button" variant="outline" size="sm" :loading="activeAction === 'refreshDetail'"
          :onClick="refreshDetail">
          {{ $t('catalogImports.actions.refresh') }}
        </Button>
      </div>

      <div v-if="catalogImportStore.isLoading && !selectedJobDetail" class="p-8 text-center">
        <Spinner />
      </div>

      <template v-if="selectedJobDetail">
        <JobSummaryPanel :job="selectedJobDetail" />

        <template v-if="isCategoryImportJob">
          <CategoryProvisioningPanel v-if="selectedBundleId" :categoryLinks="selectedBundleDetail.categoryLinks.data"
            :pagination="selectedBundleDetail.categoryLinks.pagination" :searchTerm="categoryLinksSearchTerm"
            @update:searchTerm="handleCategoryLinksSearch"
            @pageChange="page => fetchCategoryLinks({ pageNumber: page })"
            @pageSizeChange="pageSize => fetchCategoryLinks({ pageNumber: 1, pageSize })" />
          <section v-else
            class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ $t('catalogImports.sections.categoryProvisioning') }}
            </h2>
            <p class="mt-1 text-sm text-gray-500">
              {{ $t('catalogImports.empty.categoryProvisioningJobDetail') }}
            </p>
          </section>
        </template>

        <template v-if="isProductImportJob">
          <section v-if="selectedBundleId"
            class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                  {{ $t('catalogImports.sections.workflowActions') }}
                </h2>
                <p class="mt-1 text-sm text-gray-500">
                  {{ $t('catalogImports.validation.description') }}
                </p>
              </div>
              <div class="flex flex-wrap items-end gap-2">
                <div class="min-w-56">
                  <Select v-model="selectedPublicationState" :label="$t('catalogImports.import.publicationStateLabel')"
                    :options="publicationStateOptions" :disabled="catalogImportStore.isSubmitting" />
                </div>
                <Button type="button" variant="outline" size="md" :disabled="catalogImportStore.isSubmitting"
                  :loading="activeAction === 'validateBundle'" :onClick="handleValidateBundle">
                  {{ $t('catalogImports.actions.validateBundle') }}
                </Button>
                <Button type="button" variant="outline" size="md" :disabled="catalogImportStore.isSubmitting"
                  :loading="activeAction === 'provisionSellers'" :onClick="handleProvisionSellers">
                  {{ $t('catalogImports.actions.provisionSellers') }}
                </Button>
                <Button type="button" variant="primary" size="md" :disabled="isImportAllDisabled"
                  :loading="activeAction === 'importAllReadyProducts'" :onClick="handleImportAllReadyProducts">
                  {{ $t('catalogImports.actions.importAllReadyProducts') }}
                </Button>
                <Button type="button" variant="outline" size="md" :disabled="isImportSelectedDisabled"
                  :loading="activeAction === 'importSelectedReadyProducts'"
                  :onClick="handleImportSelectedReadyProducts">
                  {{ $t('catalogImports.actions.importSelectedReadyProducts') }}
                </Button>
              </div>
            </div>

            <p class="mt-4 text-sm text-gray-500">
              {{ $t('catalogImports.products.importAllReadyDescription') }}
            </p>
            <p class="mt-2 text-sm text-gray-500">
              {{
                $t('catalogImports.products.selectedImportableProducts', {
                  count: selectedProductIds.length,
                })
              }}
            </p>
          </section>

          <BundleSummaryPanel v-if="selectedBundleDetail.bundle" :bundle="selectedBundleDetail.bundle" />

          <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ $t('catalogImports.sections.sellerApproval') }}
            </h2>
            <div class="mt-4 grid gap-3 md:grid-cols-3">
              <Input v-model="approvalTargetUserId" :label="$t('catalogImports.sellers.targetUserId')" />
              <Input v-model="approvalTargetStoreId" :label="$t('catalogImports.sellers.targetStoreId')" />
              <Input v-model="approvalReason" :label="$t('catalogImports.sellers.approvalReason')" />
            </div>
            <p v-if="approvalError" class="mt-3 text-sm text-error-500">{{ approvalError }}</p>
          </section>

          <section class="space-y-4">
            <Tabs v-model="activeProductReviewTab" :options="productReviewTabOptions" variant="pills" />

            <CategoryProvisioningPanel v-if="activeProductReviewTab === 'categoryLinks'"
              :categoryLinks="selectedBundleDetail.categoryLinks.data"
              :pagination="selectedBundleDetail.categoryLinks.pagination" :searchTerm="categoryLinksSearchTerm"
              @update:searchTerm="handleCategoryLinksSearch"
              @pageChange="page => fetchCategoryLinks({ pageNumber: page })"
              @pageSizeChange="pageSize => fetchCategoryLinks({ pageNumber: 1, pageSize })" />
            <ImportedSellersTable v-else-if="activeProductReviewTab === 'sellers'"
              :sellers="selectedBundleDetail.sellers.data" :pagination="selectedBundleDetail.sellers.pagination"
              :searchTerm="sellersSearchTerm"
              :disabled="catalogImportStore.isSubmitting" :loadingSellerId="approvingSellerId"
              @approve="handleApproveSeller" @update:searchTerm="handleSellersSearch"
              @pageChange="page => fetchSellers({ pageNumber: page })"
              @pageSizeChange="pageSize => fetchSellers({ pageNumber: 1, pageSize })" />
            <ImportedProductsTable v-else v-model:selected-product-ids="selectedProductIds"
              :products="selectedBundleDetail.products.data" :pagination="selectedBundleDetail.products.pagination"
              :searchTerm="productsSearchTerm" :selectable="true" :disabled="catalogImportStore.isSubmitting"
              @update:searchTerm="handleProductsSearch"
              @pageChange="page => fetchProducts({ pageNumber: page })"
              @pageSizeChange="pageSize => fetchProducts({ pageNumber: 1, pageSize })" />
          </section>

          <ValidationIssueTable :issues="selectedBundleDetail.validationIssues.data"
            :pagination="selectedBundleDetail.validationIssues.pagination" :searchTerm="validationIssuesSearchTerm"
            @update:searchTerm="handleValidationIssuesSearch"
            @pageChange="page => fetchValidationIssues({ pageNumber: page })"
            @pageSizeChange="pageSize => fetchValidationIssues({ pageNumber: 1, pageSize })"
            @mapCategory="handleMapCategory" />
          <DuplicateGroupsTable :duplicateGroups="selectedBundleDetail.duplicateGroups.data"
            :pagination="selectedBundleDetail.duplicateGroups.pagination" :searchTerm="duplicateGroupsSearchTerm"
            @update:searchTerm="handleDuplicateGroupsSearch"
            @pageChange="page => fetchDuplicateGroups({ pageNumber: page })"
            @pageSizeChange="pageSize => fetchDuplicateGroups({ pageNumber: 1, pageSize })" />
        </template>

        <section v-if="!isCategoryImportJob && !isProductImportJob"
          class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p class="text-sm text-gray-500">
            {{ $t('catalogImports.empty.operationSections') }}
          </p>
        </section>
      </template>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  AppShell,
  BackArrowIcon,
  Button,
  ConfirmModal,
  Input,
  PageBreadcrumb,
  Select,
  Spinner,
  Tabs,
  useModal,
} from '@hivespace/shared'
import BundleSummaryPanel from '@/components/catalog-imports/BundleSummaryPanel.vue'
import CategoryMappingModal from '@/components/catalog-imports/CategoryMappingModal.vue'
import CategoryProvisioningPanel from '@/components/catalog-imports/CategoryProvisioningPanel.vue'
import DuplicateGroupsTable from '@/components/catalog-imports/DuplicateGroupsTable.vue'
import ImportedProductsTable from '@/components/catalog-imports/ImportedProductsTable.vue'
import ImportedSellersTable from '@/components/catalog-imports/ImportedSellersTable.vue'
import JobSummaryPanel from '@/components/catalog-imports/JobSummaryPanel.vue'
import ValidationIssueTable from '@/components/catalog-imports/ValidationIssueTable.vue'
import { useCatalogImportStore } from '@/stores/catalog-import.store'
import type {
  BundleCategoryLinksQuery,
  BundleDuplicateGroupsQuery,
  BundleProductsQuery,
  BundleSellersQuery,
  BundleValidationIssuesQuery,
  CatalogImportPublicationState,
  CatalogImportValidationIssue,
  ImportedSeller,
} from '@/types'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { openModal } = useModal()
const catalogImportStore = useCatalogImportStore()
const {
  selectedJobDetail,
  selectedBundleDetail,
  selectedBundleId,
  categoryOptions,
  importableProductIds,
} = storeToRefs(catalogImportStore)

type ProductReviewTab = 'categoryLinks' | 'sellers' | 'products'
type DetailAction =
  | 'refreshDetail'
  | 'validateBundle'
  | 'provisionSellers'
  | 'importAllReadyProducts'
  | 'importSelectedReadyProducts'
  | 'retryJob'
  | 'approveSellerOwnership'
  | 'mapCategory'
  | null

const DEFAULT_PRODUCT_REVIEW_TAB: ProductReviewTab = 'products'

const activeProductReviewTab = ref<ProductReviewTab>(DEFAULT_PRODUCT_REVIEW_TAB)
const selectedProductIds = ref<string[]>([])
const selectedPublicationState = ref<CatalogImportPublicationState>('Draft')
const selectedProductsBundleId = ref<string | null>(null)
const hasInitializedProductSelectionForBundle = ref(false)
const categoryLinksSearchTerm = ref('')
const sellersSearchTerm = ref('')
const productsSearchTerm = ref('')
const validationIssuesSearchTerm = ref('')
const duplicateGroupsSearchTerm = ref('')
const approvalTargetUserId = ref('')
const approvalTargetStoreId = ref('')
const approvalReason = ref('')
const approvalError = ref<string | null>(null)
const activeAction = ref<DetailAction>(null)
const approvingSellerId = ref<string | null>(null)

const catalogImportsRoute = computed(() => ({ name: 'CatalogImports' as const }))
const jobId = computed(() => String(route.params.jobId ?? ''))
const bundleImportableProductCount = computed(
  () =>
    (selectedBundleDetail.value.bundle?.summary.readyProducts ?? 0) +
    (selectedBundleDetail.value.bundle?.summary.warningCount ?? 0),
)
const isImportBlocked = computed(() => catalogImportStore.isSubmitting)
const isImportAllDisabled = computed(
  () => isImportBlocked.value || bundleImportableProductCount.value === 0,
)
const isImportSelectedDisabled = computed(
  () => isImportBlocked.value || selectedProductIds.value.length === 0,
)
const isCategoryImportJob = computed(
  () => selectedJobDetail.value?.operationType === 'ProvisionCategories',
)
const canRetrySelectedJob = computed(() => selectedJobDetail.value?.status === 'Failed')
const isProductImportJob = computed(() =>
  [
    'SubmitBundle',
    'ValidateBundle',
    'ProvisionSellers',
    'ImportReadyProducts',
  ].includes(selectedJobDetail.value?.operationType ?? ''),
)
const productReviewTabOptions = computed(() => [
  {
    label: t('catalogImports.sections.categoryLinks'),
    value: 'categoryLinks',
  },
  {
    label: t('catalogImports.sections.sellers'),
    value: 'sellers',
  },
  {
    label: t('catalogImports.sections.products'),
    value: 'products',
  },
])
const publicationStateOptions = computed(() => [
  {
    label: t('catalogImports.import.states.Draft'),
    value: 'Draft',
  },
  {
    label: t('catalogImports.import.states.Unpublish'),
    value: 'Unpublish',
  },
  {
    label: t('catalogImports.import.states.Available'),
    value: 'Available',
  },
])

const runWithAction = async <T>(action: Exclude<DetailAction, null>, task: () => Promise<T>) => {
  activeAction.value = action

  try {
    return await task()
  } finally {
    activeAction.value = null
  }
}

const normalizedSearchTerm = (searchTerm: string) => {
  const normalized = searchTerm.trim()
  return normalized.length > 0 ? normalized : undefined
}

const refreshDetail = async () => {
  if (!jobId.value) return

  await runWithAction('refreshDetail', async () => {
    await catalogImportStore.fetchJobDetail(jobId.value)
    if (
      selectedJobDetail.value?.status === 'Pending' ||
      selectedJobDetail.value?.status === 'Running'
    ) {
      catalogImportStore.startPollingJob(jobId.value)
    }
  })
}

const fetchCategoryLinks = async (query: BundleCategoryLinksQuery) => {
  if (!selectedBundleId.value) return
  await catalogImportStore.fetchBundleCategoryLinks(selectedBundleId.value, {
    pageSize: selectedBundleDetail.value.categoryLinks.pagination.pageSize,
    searchTerm: normalizedSearchTerm(categoryLinksSearchTerm.value),
    ...query,
  })
}

const fetchSellers = async (query: BundleSellersQuery) => {
  if (!selectedBundleId.value) return
  await catalogImportStore.fetchBundleSellers(selectedBundleId.value, {
    pageSize: selectedBundleDetail.value.sellers.pagination.pageSize,
    searchTerm: normalizedSearchTerm(sellersSearchTerm.value),
    ...query,
  })
}

const fetchProducts = async (query: BundleProductsQuery) => {
  if (!selectedBundleId.value) return
  await catalogImportStore.fetchBundleProducts(selectedBundleId.value, {
    pageSize: selectedBundleDetail.value.products.pagination.pageSize,
    searchTerm: normalizedSearchTerm(productsSearchTerm.value),
    ...query,
  })
}

const fetchDuplicateGroups = async (query: BundleDuplicateGroupsQuery) => {
  if (!selectedBundleId.value) return
  await catalogImportStore.fetchBundleDuplicateGroups(selectedBundleId.value, {
    pageSize: selectedBundleDetail.value.duplicateGroups.pagination.pageSize,
    searchTerm: normalizedSearchTerm(duplicateGroupsSearchTerm.value),
    ...query,
  })
}

const fetchValidationIssues = async (query: BundleValidationIssuesQuery) => {
  if (!selectedBundleId.value) return
  await catalogImportStore.fetchBundleValidationIssues(selectedBundleId.value, {
    pageSize: selectedBundleDetail.value.validationIssues.pagination.pageSize,
    searchTerm: normalizedSearchTerm(validationIssuesSearchTerm.value),
    ...query,
  })
}

const handleCategoryLinksSearch = async (searchTerm: string) => {
  categoryLinksSearchTerm.value = searchTerm
  await fetchCategoryLinks({ pageNumber: 1 })
}

const handleSellersSearch = async (searchTerm: string) => {
  sellersSearchTerm.value = searchTerm
  await fetchSellers({ pageNumber: 1 })
}

const handleProductsSearch = async (searchTerm: string) => {
  productsSearchTerm.value = searchTerm
  await fetchProducts({ pageNumber: 1 })
}

const handleValidationIssuesSearch = async (searchTerm: string) => {
  validationIssuesSearchTerm.value = searchTerm
  await fetchValidationIssues({ pageNumber: 1 })
}

const handleDuplicateGroupsSearch = async (searchTerm: string) => {
  duplicateGroupsSearchTerm.value = searchTerm
  await fetchDuplicateGroups({ pageNumber: 1 })
}

const startActionPolling = (submission: { jobId: string }) => {
  catalogImportStore.startPollingJob(submission.jobId)
}

const handleValidateBundle = async () => {
  if (!selectedBundleId.value) return
  startActionPolling(
    await runWithAction('validateBundle', async () =>
      catalogImportStore.validateBundle(selectedBundleId.value!),
    ),
  )
}

const handleProvisionSellers = async () => {
  if (!selectedBundleId.value) return
  startActionPolling(
    await runWithAction('provisionSellers', async () =>
      catalogImportStore.provisionSellers(selectedBundleId.value!),
    ),
  )
}

const handleImportAllReadyProducts = async () => {
  if (!selectedBundleId.value || isImportAllDisabled.value) return

  startActionPolling(
    await runWithAction('importAllReadyProducts', async () =>
      catalogImportStore.importReadyProducts(selectedBundleId.value!, {
        publicationState: selectedPublicationState.value,
      }),
    ),
  )
}

const handleImportSelectedReadyProducts = async () => {
  if (!selectedBundleId.value || isImportSelectedDisabled.value) return

  startActionPolling(
    await runWithAction('importSelectedReadyProducts', async () =>
      catalogImportStore.importReadyProducts(selectedBundleId.value!, {
        productIds: selectedProductIds.value,
        publicationState: selectedPublicationState.value,
      }),
    ),
  )
}

const handleRetryJob = async () => {
  if (!jobId.value || !canRetrySelectedJob.value) return

  const submission = await runWithAction('retryJob', async () =>
    catalogImportStore.retryJob(jobId.value),
  )
  await router.push(`/catalog-imports/jobs/${submission.jobId}`)
  startActionPolling(submission)
}

const handleApproveSeller = async (seller: ImportedSeller) => {
  approvalError.value = null
  const importedSellerId = seller.importedSellerId ?? seller.externalSellerId
  const candidate = seller.existingStoreCandidates?.[0]
  approvalTargetUserId.value = approvalTargetUserId.value || candidate?.userId || ''
  approvalTargetStoreId.value = approvalTargetStoreId.value || candidate?.storeId || ''

  if (
    !approvalTargetUserId.value.trim() ||
    !approvalTargetStoreId.value.trim() ||
    !approvalReason.value.trim()
  ) {
    approvalError.value = t('catalogImports.sellers.approvalReasonRequired')
    return
  }

  const result = await openModal<{ result: 'confirm' | 'cancel' }>(ConfirmModal, {
    title: t('catalogImports.sellers.approvalConfirmTitle'),
    message: t('catalogImports.sellers.approvalConfirmMessage'),
    confirmText: t('catalogImports.actions.approveSellerOwnership'),
    cancelText: t('catalogImports.actions.cancel'),
    variant: 'warning',
  })

  if (result?.result !== 'confirm' || !selectedBundleId.value) return

  approvingSellerId.value = importedSellerId

  try {
    await runWithAction('approveSellerOwnership', async () => {
      await catalogImportStore.approveSellerOwnership(selectedBundleId.value!, importedSellerId, {
        targetUserId: approvalTargetUserId.value.trim(),
        targetStoreId: approvalTargetStoreId.value.trim(),
        approvalReason: approvalReason.value.trim(),
      })
    })
    approvalReason.value = ''
  } finally {
    approvingSellerId.value = null
  }
}

const handleMapCategory = async (issue: CatalogImportValidationIssue) => {
  if (!selectedBundleId.value) return

  await catalogImportStore.fetchCategoryOptions()

  const importedProduct = selectedBundleDetail.value.products.data.find(
    product => product.externalProductId === issue.entitySourceId,
  )

  const result = await openModal<{
    hiveSpaceCategoryId: number
    externalCategoryId: string
  }>(CategoryMappingModal, {
    title: t('catalogImports.mapping.title'),
    description: t('catalogImports.mapping.description'),
    maxWidth: '420px',
    externalProductId: issue.entitySourceId,
    productName: importedProduct?.title ?? null,
    externalCategoryIds: issue.metadata?.missingExternalCategoryIds ?? [],
    categories: categoryOptions.value,
  })

  if (!result) return

  await runWithAction('mapCategory', async () => {
    await catalogImportStore.mapImportedCategory(selectedBundleId.value!, result.externalCategoryId, {
      hiveSpaceCategoryId: result.hiveSpaceCategoryId,
    })
  })
}

const resetProductSelectionForBundle = (bundleId: string | null) => {
  selectedProductsBundleId.value = bundleId
  selectedProductIds.value = []
  hasInitializedProductSelectionForBundle.value = false
  activeProductReviewTab.value = DEFAULT_PRODUCT_REVIEW_TAB
  categoryLinksSearchTerm.value = ''
  sellersSearchTerm.value = ''
  productsSearchTerm.value = ''
  validationIssuesSearchTerm.value = ''
  duplicateGroupsSearchTerm.value = ''
}

const syncSelectedProductsForCurrentPage = () => {
  const visibleProductIds = selectedBundleDetail.value.products.data.map(product => product.productId)

  if (visibleProductIds.length === 0) return

  const importableProductIdSet = new Set(importableProductIds.value)

  selectedProductIds.value = selectedProductIds.value.filter(
    productId =>
      !visibleProductIds.includes(productId) ||
      importableProductIdSet.has(productId),
  )
}

watch(
  selectedBundleId,
  bundleId => {
    if (!bundleId) {
      resetProductSelectionForBundle(null)
      return
    }

    if (bundleId !== selectedProductsBundleId.value) {
      resetProductSelectionForBundle(bundleId)
    }
  },
  { immediate: true },
)

watch(
  importableProductIds,
  () => {
    if (!selectedBundleId.value) {
      selectedProductIds.value = []
      hasInitializedProductSelectionForBundle.value = false
      return
    }

    if (selectedProductsBundleId.value !== selectedBundleId.value) {
      resetProductSelectionForBundle(selectedBundleId.value)
      return
    }

    if (!hasInitializedProductSelectionForBundle.value) {
      selectedProductIds.value = [...importableProductIds.value]
      hasInitializedProductSelectionForBundle.value = true
      return
    }

    syncSelectedProductsForCurrentPage()
  },
  { immediate: true },
)

onMounted(async () => {
  await refreshDetail()
})

onBeforeUnmount(() => {
  catalogImportStore.stopPollingJob()
})
</script>

import { useAppStore, type PaginationMetadata } from '@hivespace/shared'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import i18n from '@/i18n'
import { catalogImportService } from '@/services/catalog-import.service'
import type {
  ApproveSellerOwnershipRequest,
  BundleCategoryLinksQuery,
  BundleDuplicateGroupsQuery,
  BundleProductsQuery,
  BundleSellersQuery,
  BundleValidationIssuesQuery,
  CatalogImportBundleQuery,
  CatalogImportBundleDetail,
  CatalogImportBundleSummary,
  CatalogImportJobDetail,
  CatalogImportJobHistoryRow,
  CatalogImportJobQuery,
  CatalogImportJobSubmission,
  CatalogImportPaginatedResponse,
  ImportReadyCatalogProductsRequest,
  SubmitCategoryProvisioningRequest,
  SubmitCatalogImportBundleRequest,
} from '@/types'

const defaultPagination = (pageNumber = 1, pageSize = 10): PaginationMetadata => ({
  currentPage: pageNumber,
  pageSize,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
})

const emptyPage = <T>(pageNumber = 1, pageSize = 10): CatalogImportPaginatedResponse<T> => ({
  data: [],
  pagination: defaultPagination(pageNumber, pageSize),
})

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : i18n.global.t('catalogImports.notifications.failed')

const isTerminalJobStatus = (status?: string | null) =>
  status === 'Completed' || status === 'Failed'

export const useCatalogImportStore = defineStore('catalogImport', () => {
  const bundleHistory = ref<CatalogImportBundleSummary[]>([])
  const bundleHistoryPagination = ref<PaginationMetadata>(defaultPagination())
  const bundleFilters = ref<CatalogImportBundleQuery>({ pageNumber: 1, pageSize: 10 })
  const categoryProvisioningHistory = ref<CatalogImportJobHistoryRow[]>([])
  const categoryProvisioningHistoryPagination = ref<PaginationMetadata>(defaultPagination())
  const categoryProvisioningFilters = ref<CatalogImportJobQuery>({
    pageNumber: 1,
    pageSize: 10,
    operationType: 'ProvisionCategories',
  })
  const jobHistory = ref<CatalogImportJobHistoryRow[]>([])
  const jobHistoryPagination = ref<PaginationMetadata>(defaultPagination())
  const jobFilters = ref<CatalogImportJobQuery>({ pageNumber: 1, pageSize: 10 })
  const selectedBundleSummary = ref<CatalogImportBundleSummary | null>(null)
  const selectedBundleJobs = ref<CatalogImportJobHistoryRow[]>([])
  const selectedBundleJobsPagination = ref<PaginationMetadata>(defaultPagination())
  const selectedBundleJobFilters = ref<CatalogImportJobQuery>({ pageNumber: 1, pageSize: 10 })
  const selectedJobDetail = ref<CatalogImportJobDetail | null>(null)
  const selectedBundleDetail = ref<CatalogImportBundleDetail>({
    bundle: null,
    categoryLinks: emptyPage(),
    sellers: emptyPage(),
    products: emptyPage(),
    duplicateGroups: emptyPage(),
    validationIssues: emptyPage(),
  })
  const activeJob = ref<CatalogImportJobSubmission | null>(null)
  const uploadCreatedJob = ref<CatalogImportJobSubmission | null>(null)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const isPolling = ref(false)
  const error = ref<string | null>(null)
  const pollingTimer = ref<number | null>(null)

  const selectedJobId = computed(() => selectedJobDetail.value?.jobId ?? null)
  const selectedBundleId = computed(
    () => selectedJobDetail.value?.bundleId ?? selectedBundleDetail.value.bundle?.bundleId ?? null,
  )
  const hasSellerOwnershipGaps = computed(() =>
    selectedBundleDetail.value.sellers.data.some(
      seller =>
        seller.status === 'Conflict' ||
        seller.status === 'Failed' ||
        !seller.userId ||
        !seller.storeId,
    ),
  )
  const hasBlockingIssues = computed(() =>
    selectedBundleDetail.value.validationIssues.data.some(issue => issue.severity === 'Blocking'),
  )
  const hasUnresolvedDuplicates = computed(
    () => selectedBundleDetail.value.duplicateGroups.data.length > 0,
  )
  const importableProductIds = computed(() =>
    selectedBundleDetail.value.products.data
      .filter(product => product.readinessStatus === 'Ready' || product.readinessStatus === 'Warning')
      .map(product => product.productId),
  )

  const withLoading = async <T>(action: () => Promise<T>, submitting = false) => {
    const appStore = useAppStore()

    try {
      isLoading.value = true
      isSubmitting.value = submitting
      error.value = null
      appStore.setLoading(true)
      return await action()
    } catch (err) {
      error.value = getErrorMessage(err)
      appStore.notifyError(i18n.global.t('catalogImports.notifications.errorTitle'), error.value)
      throw err
    } finally {
      isLoading.value = false
      isSubmitting.value = false
      appStore.setLoading(false)
    }
  }

  const rememberActiveJob = (job: CatalogImportJobSubmission) => {
    activeJob.value = job
    uploadCreatedJob.value = job
    return job
  }

  const fetchBundleHistory = async (query: CatalogImportBundleQuery = bundleFilters.value) =>
    withLoading(async () => {
      bundleFilters.value = { pageNumber: 1, pageSize: 10, ...query }
      const response = await catalogImportService.listBundles(bundleFilters.value)
      bundleHistory.value = response.data
      bundleHistoryPagination.value = response.pagination
      return response
    })

  const fetchJobHistory = async (query: CatalogImportJobQuery = jobFilters.value) =>
    withLoading(async () => {
      jobFilters.value = { pageNumber: 1, pageSize: 10, ...query }
      const response = await catalogImportService.listJobs(jobFilters.value)
      jobHistory.value = response.data
      jobHistoryPagination.value = response.pagination
      return response
    })

  const fetchCategoryProvisioningHistory = async (
    query: CatalogImportJobQuery = categoryProvisioningFilters.value,
  ) =>
    withLoading(async () => {
      categoryProvisioningFilters.value = {
        pageNumber: 1,
        pageSize: 10,
        ...query,
        operationType: 'ProvisionCategories',
      }
      const response = await catalogImportService.listJobs(categoryProvisioningFilters.value)
      categoryProvisioningHistory.value = response.data
      categoryProvisioningHistoryPagination.value = response.pagination
      return response
    })

  const fetchSelectedBundleJobs = async (
    bundleId: string,
    query: CatalogImportJobQuery = selectedBundleJobFilters.value,
  ) =>
    withLoading(async () => {
      selectedBundleJobFilters.value = { pageNumber: 1, pageSize: 10, ...query, bundleId }
      const response = await catalogImportService.listJobs(selectedBundleJobFilters.value)
      selectedBundleJobs.value = response.data
      selectedBundleJobsPagination.value = response.pagination

      if (!selectedBundleSummary.value || selectedBundleSummary.value.bundleId !== bundleId) {
        selectedBundleSummary.value = await catalogImportService.getBundleSummary(bundleId)
      }

      return response
    })

  const setSelectedBundleSummary = (bundle: CatalogImportBundleSummary | null) => {
    selectedBundleSummary.value = bundle

    if (!bundle) {
      selectedBundleJobs.value = []
      selectedBundleJobsPagination.value = defaultPagination()
      selectedBundleJobFilters.value = { pageNumber: 1, pageSize: 10 }
    }
  }

  const fetchJobDetail = async (jobId: string) =>
    withLoading(async () => {
      const response = await catalogImportService.getJob(jobId)
      selectedJobDetail.value = response
      if (response.bundleId) {
        await fetchBundleDetail(response.bundleId)
      }
      return response
    })

  const fetchBundleSummary = async (bundleId: string) => {
    const bundle = await catalogImportService.getBundleSummary(bundleId)
    selectedBundleSummary.value = bundle
    selectedBundleDetail.value.bundle = bundle
    return bundle
  }

  const fetchBundleCategoryLinks = async (
    bundleId: string,
    query: BundleCategoryLinksQuery = {},
  ) => {
    const response = await catalogImportService.listBundleCategoryLinks(bundleId, query)
    selectedBundleDetail.value.categoryLinks = response
    return response
  }

  const fetchBundleSellers = async (bundleId: string, query: BundleSellersQuery = {}) => {
    const response = await catalogImportService.listBundleSellers(bundleId, query)
    selectedBundleDetail.value.sellers = response
    return response
  }

  const fetchBundleProducts = async (bundleId: string, query: BundleProductsQuery = {}) => {
    const response = await catalogImportService.listBundleProducts(bundleId, query)
    selectedBundleDetail.value.products = response
    return response
  }

  const fetchBundleDuplicateGroups = async (
    bundleId: string,
    query: BundleDuplicateGroupsQuery = {},
  ) => {
    const response = await catalogImportService.listBundleDuplicateGroups(bundleId, query)
    selectedBundleDetail.value.duplicateGroups = response
    return response
  }

  const fetchBundleValidationIssues = async (
    bundleId: string,
    query: BundleValidationIssuesQuery = {},
  ) => {
    const response = await catalogImportService.listBundleValidationIssues(bundleId, query)
    selectedBundleDetail.value.validationIssues = response
    return response
  }

  const fetchBundleDetail = async (bundleId: string) =>
    withLoading(async () => {
      const [
        bundle,
        categoryLinks,
        sellers,
        products,
        duplicateGroups,
        validationIssues,
      ] = await Promise.all([
        catalogImportService.getBundleSummary(bundleId),
        catalogImportService.listBundleCategoryLinks(bundleId, { pageNumber: 1, pageSize: 10 }),
        catalogImportService.listBundleSellers(bundleId, { pageNumber: 1, pageSize: 10 }),
        catalogImportService.listBundleProducts(bundleId, { pageNumber: 1, pageSize: 10 }),
        catalogImportService.listBundleDuplicateGroups(bundleId, { pageNumber: 1, pageSize: 10 }),
        catalogImportService.listBundleValidationIssues(bundleId, { pageNumber: 1, pageSize: 10 }),
      ])
      selectedBundleDetail.value = {
        bundle,
        categoryLinks,
        sellers,
        products,
        duplicateGroups,
        validationIssues,
      }
      selectedBundleSummary.value = bundle
      return selectedBundleDetail.value
    })

  const provisionCategories = async (
    payload: SubmitCategoryProvisioningRequest,
    sourceFileName?: string | null,
  ) =>
    withLoading(async () => {
      const response = await catalogImportService.provisionCategories(payload, sourceFileName)
      rememberActiveJob(response)
      useAppStore().notifySuccess(
        i18n.global.t('catalogImports.notifications.jobQueuedTitle'),
        i18n.global.t('catalogImports.notifications.categoriesQueuedMessage'),
      )
      await fetchCategoryProvisioningHistory()
      return response
    }, true)

  const submitBundle = async (
    payload: SubmitCatalogImportBundleRequest,
    sourceFileName?: string | null,
  ) =>
    withLoading(async () => {
      const response = await catalogImportService.submitBundle(payload, sourceFileName)
      rememberActiveJob(response)
      useAppStore().notifySuccess(
        i18n.global.t('catalogImports.notifications.jobQueuedTitle'),
        i18n.global.t('catalogImports.notifications.bundleQueuedMessage'),
      )
      await fetchBundleHistory()
      return response
    }, true)

  const validateBundle = async (bundleId: string) =>
    withLoading(async () => {
      const response = await catalogImportService.validateBundle(bundleId)
      rememberActiveJob(response)
      await Promise.all([fetchBundleHistory(), fetchSelectedBundleJobs(bundleId)])
      return response
    }, true)

  const provisionSellers = async (bundleId: string) =>
    withLoading(async () => {
      const response = await catalogImportService.provisionSellers(bundleId)
      rememberActiveJob(response)
      await Promise.all([fetchBundleHistory(), fetchSelectedBundleJobs(bundleId)])
      return response
    }, true)

  const approveSellerOwnership = async (
    bundleId: string,
    importedSellerId: string,
    payload: ApproveSellerOwnershipRequest,
  ) =>
    withLoading(async () => {
      const response = await catalogImportService.approveSellerOwnership(
        bundleId,
        importedSellerId,
        payload,
      )
      useAppStore().notifySuccess(
        i18n.global.t('catalogImports.notifications.sellerApprovedTitle'),
        i18n.global.t('catalogImports.notifications.sellerApprovedMessage'),
      )
      await fetchBundleDetail(bundleId)
      return response
    }, true)

  const importReadyProducts = async (
    bundleId: string,
    payload: ImportReadyCatalogProductsRequest,
  ) =>
    withLoading(async () => {
      const response = await catalogImportService.importReadyProducts(bundleId, payload)
      rememberActiveJob(response)
      await Promise.all([fetchBundleHistory(), fetchSelectedBundleJobs(bundleId)])
      return response
    }, true)

  const retryJob = async (jobId: string) =>
    withLoading(async () => {
      const response = await catalogImportService.retryJob(jobId)
      rememberActiveJob(response)
      await Promise.all([fetchJobHistory(), fetchBundleHistory(), fetchCategoryProvisioningHistory()])
      return response
    }, true)

  const fetchJobStatus = async (jobId: string) => {
    const response = await catalogImportService.getJob(jobId)
    selectedJobDetail.value = response
    activeJob.value = response
    return response
  }

  const stopPollingJob = () => {
    if (pollingTimer.value) {
      window.clearInterval(pollingTimer.value)
      pollingTimer.value = null
    }
    isPolling.value = false
  }

  const refreshAfterCompletedJob = async (job: CatalogImportJobDetail) => {
    const refreshes: Promise<unknown>[] = [
      fetchJobHistory(jobFilters.value),
      fetchBundleHistory(bundleFilters.value),
      fetchCategoryProvisioningHistory(categoryProvisioningFilters.value),
    ]

    if (job.bundleId) {
      refreshes.push(fetchBundleDetail(job.bundleId))
      if (selectedBundleSummary.value?.bundleId === job.bundleId) {
        refreshes.push(fetchSelectedBundleJobs(job.bundleId, selectedBundleJobFilters.value))
      }
    }

    await Promise.all(refreshes)
  }

  const startPollingJob = (jobId: string, intervalMs = 2000) => {
    stopPollingJob()
    isPolling.value = true
    pollingTimer.value = window.setInterval(() => {
      void fetchJobStatus(jobId).then(job => {
        if (!isTerminalJobStatus(job.status)) return

        stopPollingJob()
        if (job.status === 'Completed') {
          void refreshAfterCompletedJob(job)
        }
      })
    }, intervalMs)
  }

  const clearSelection = () => {
    bundleHistory.value = []
    bundleHistoryPagination.value = defaultPagination()
    categoryProvisioningHistory.value = []
    categoryProvisioningHistoryPagination.value = defaultPagination()
    selectedJobDetail.value = null
    selectedBundleSummary.value = null
    selectedBundleJobs.value = []
    selectedBundleJobsPagination.value = defaultPagination()
    selectedBundleDetail.value = {
      bundle: null,
      categoryLinks: emptyPage(),
      sellers: emptyPage(),
      products: emptyPage(),
      duplicateGroups: emptyPage(),
      validationIssues: emptyPage(),
    }
    activeJob.value = null
    uploadCreatedJob.value = null
    stopPollingJob()
  }

  return {
    bundleHistory,
    bundleHistoryPagination,
    bundleFilters,
    categoryProvisioningHistory,
    categoryProvisioningHistoryPagination,
    categoryProvisioningFilters,
    jobHistory,
    jobHistoryPagination,
    jobFilters,
    selectedBundleSummary,
    selectedBundleJobs,
    selectedBundleJobsPagination,
    selectedBundleJobFilters,
    selectedJobDetail,
    selectedJobId,
    selectedBundleDetail,
    selectedBundleId,
    activeJob,
    uploadCreatedJob,
    isLoading,
    isSubmitting,
    isPolling,
    error,
    hasSellerOwnershipGaps,
    hasBlockingIssues,
    hasUnresolvedDuplicates,
    importableProductIds,
    fetchBundleHistory,
    fetchCategoryProvisioningHistory,
    fetchJobHistory,
    fetchSelectedBundleJobs,
    setSelectedBundleSummary,
    fetchJobDetail,
    fetchBundleSummary,
    fetchBundleCategoryLinks,
    fetchBundleSellers,
    fetchBundleProducts,
    fetchBundleDuplicateGroups,
    fetchBundleValidationIssues,
    fetchBundleDetail,
    provisionCategories,
    submitBundle,
    validateBundle,
    provisionSellers,
    approveSellerOwnership,
    importReadyProducts,
    retryJob,
    fetchJobStatus,
    startPollingJob,
    stopPollingJob,
    clearSelection,
  }
})

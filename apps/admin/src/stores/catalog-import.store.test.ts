import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { catalogImportService } from '@/services/catalog-import.service'
import { categoryService } from '@/services/category.service'
import { useCatalogImportStore } from './catalog-import.store'
import type {
  CategoryAttributeChunk,
  CatalogImportBundleSummary,
  CatalogImportJobDetail,
  CatalogImportJobHistoryRow,
  CatalogImportPaginatedResponse,
  CatalogImportValidationIssue,
  ImportedProduct,
  ImportedSeller,
  ProvisionedCategoryLink,
  SubmitCategoryProvisioningRequest,
} from '@/types'

const mockSetLoading = jest.fn()
const mockNotifySuccess = jest.fn()

jest.mock('@/services/catalog-import.service', () => ({
  catalogImportService: {
    provisionCategories: jest.fn(),
    provisionCategoryAttributes: jest.fn(),
    submitBundle: jest.fn(),
    listBundles: jest.fn(),
    listJobs: jest.fn(),
    getJob: jest.fn(),
    getBundleSummary: jest.fn(),
    listBundleCategoryLinks: jest.fn(),
    listBundleSellers: jest.fn(),
    listBundleProducts: jest.fn(),
    listBundleDuplicateGroups: jest.fn(),
    listBundleValidationIssues: jest.fn(),
    validateBundle: jest.fn(),
    provisionSellers: jest.fn(),
    approveSellerOwnership: jest.fn(),
    mapImportedCategory: jest.fn(),
    importReadyProducts: jest.fn(),
    retryJob: jest.fn(),
  },
}))

jest.mock('@/services/category.service', () => ({
  categoryService: {
    getCategories: jest.fn(),
  },
}))

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')

  return {
    ...actual,
    useAppStore: () => ({
      setLoading: mockSetLoading,
      notifySuccess: mockNotifySuccess,
      notifyError: jest.fn(),
    }),
  }
})

const pagination = {
  currentPage: 1,
  pageSize: 10,
  totalItems: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

const page = <T>(data: T[]): CatalogImportPaginatedResponse<T> => ({
  data,
  pagination: { ...pagination, totalItems: data.length },
})

const jobFixture: CatalogImportJobHistoryRow = {
  jobId: 'job-001',
  status: 'Pending',
  operationType: 'SubmitBundle',
  sourceSystem: 'tiki',
  sourceFingerprint: 'sha256:bundle-001',
  sourceFileName: 'bundle.json',
  bundleId: 'bundle-001',
  requestedByUserId: 'admin-001',
  requestedAt: '2026-08-04T10:00:00Z',
  startedAt: null,
  completedAt: null,
  progress: { total: 20, processed: 0 },
  resultSummary: null,
  errorSummary: null,
}

const categoryJobFixture: CatalogImportJobHistoryRow = {
  ...jobFixture,
  jobId: 'job-categories',
  operationType: 'ProvisionCategories',
  sourceFileName: 'categories.json',
  bundleId: null,
}

const categoryAttributeJobFixture: CatalogImportJobHistoryRow = {
  ...jobFixture,
  jobId: 'job-category-attributes',
  operationType: 'ProvisionCategoryAttributes',
  sourceFileName: 'chunk-0001.json',
  bundleId: null,
}

const bundleFixture: CatalogImportBundleSummary = {
  bundleId: 'bundle-001',
  status: 'NeedsAttention',
  sourceFileName: 'bundle.json',
  source: { system: 'tiki', type: 'category', value: '1846' },
  crawl: {
    startedAt: '2026-08-04T09:00:00Z',
    completedAt: '2026-08-04T09:05:00Z',
    sourceFingerprint: 'sha256:bundle-001',
    checkpointId: null,
  },
  summary: {
    totalProducts: 20,
    readyProducts: 5,
    blockedProducts: 3,
    warningCount: 2,
    duplicateCount: 1,
  },
}

const sellerFixture: ImportedSeller = {
  importedSellerId: 'imported-seller-001',
  externalSellerId: 'seller-001',
  displayName: 'Tiki Trading',
  status: 'Conflict',
  conflictReason: 'Similar store name',
  userId: null,
  storeId: null,
  existingStoreCandidates: [{ userId: 'user-001', storeId: 'store-001', storeName: 'Tiki Shop' }],
}

const productFixture: ImportedProduct = {
  productId: 'product-001',
  externalProductId: '271001',
  externalSellerId: 'seller-001',
  externalCategoryIds: ['1846'],
  title: 'Imported book',
  readinessStatus: 'Ready',
  skus: [
    {
      externalSkuId: 'sku-001',
      variantSelections: {},
      price: { amount: 125000, currencyCode: 'VND' },
      stockQuantity: 10,
    },
  ],
}

const warningProductFixture: ImportedProduct = {
  productId: 'product-002',
  externalProductId: '271002',
  externalSellerId: 'seller-001',
  externalCategoryIds: ['1846'],
  title: 'Imported notebook',
  readinessStatus: 'Warning',
  skus: [
    {
      externalSkuId: 'sku-002',
      variantSelections: {},
      price: { amount: 99000, currencyCode: 'VND' },
      stockQuantity: 10,
    },
  ],
}

const categoryLinkFixture: ProvisionedCategoryLink = {
  externalCategoryId: '1846',
  categoryId: 'category-001',
  categoryName: 'Books',
  status: 'Matched',
}

const issueFixture: CatalogImportValidationIssue = {
  issueId: 'issue-001',
  entityType: 'Product',
  entitySourceId: '271001',
  field: 'externalCategoryIds',
  severity: 'Blocking',
  reasonCode: 'MissingProvisionedCategory',
}

const mockBundleDetail = () => {
  jest.mocked(catalogImportService.getBundleSummary).mockResolvedValue(bundleFixture)
  jest.mocked(catalogImportService.listBundleCategoryLinks).mockResolvedValue(page([categoryLinkFixture]))
  jest.mocked(catalogImportService.listBundleSellers).mockResolvedValue(page([sellerFixture]))
  jest.mocked(catalogImportService.listBundleProducts).mockResolvedValue(
    page([productFixture, warningProductFixture]),
  )
  jest.mocked(catalogImportService.listBundleDuplicateGroups).mockResolvedValue(
    page([
      {
        groupId: 'duplicate-001',
        externalProductIds: ['271001', '271001-copy'],
        canonicalExternalProductId: '271001',
        reasonCode: 'SameSourceProduct',
      },
    ]),
  )
  jest.mocked(catalogImportService.listBundleValidationIssues).mockResolvedValue(page([issueFixture]))
}

describe('useCatalogImportStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
    jest.useRealTimers()
    jest.mocked(catalogImportService.listBundles).mockResolvedValue(page([bundleFixture]))
    jest.mocked(catalogImportService.listJobs).mockImplementation(
      async (query?: { bundleId?: string; operationType?: string }) => {
        if (query?.bundleId === 'bundle-001') {
          return page([jobFixture])
        }

        if (query?.operationType === 'ProvisionCategories') {
          return page([categoryJobFixture])
        }

        if (query?.operationType === 'ProvisionCategoryAttributes') {
          return page([categoryAttributeJobFixture])
        }

        return page([jobFixture])
      },
    )
    mockBundleDetail()
  })

  it('should load paginated catalog import bundle history from the API', async () => {
    const store = useCatalogImportStore()

    const result = await store.fetchBundleHistory({ pageNumber: 2, pageSize: 20 })

    expect(catalogImportService.listBundles).toHaveBeenCalledWith({ pageNumber: 2, pageSize: 20 })
    expect(result.data[0]?.bundleId).toBe('bundle-001')
    expect(store.bundleHistory[0]?.sourceFileName).toBe('bundle.json')
    expect(store.bundleHistoryPagination.currentPage).toBe(1)
    expect(mockSetLoading).toHaveBeenNthCalledWith(1, true)
    expect(mockSetLoading).toHaveBeenLastCalledWith(false)
  })

  it('should load selected bundle summary and related jobs for the side pane', async () => {
    const store = useCatalogImportStore()

    store.setSelectedBundleSummary(bundleFixture)
    const result = await store.fetchSelectedBundleJobs('bundle-001', { pageNumber: 2, pageSize: 5 })

    expect(catalogImportService.listJobs).toHaveBeenCalledWith({
      pageNumber: 2,
      pageSize: 5,
      bundleId: 'bundle-001',
    })
    expect(result.data[0]?.jobId).toBe('job-001')
    expect(store.selectedBundleSummary?.bundleId).toBe('bundle-001')
    expect(store.selectedBundleJobs[0]?.jobId).toBe('job-001')
  })

  it('should load category provisioning history from the API', async () => {
    const store = useCatalogImportStore()

    const result = await store.fetchCategoryProvisioningHistory({ pageNumber: 2, pageSize: 5 })

    expect(catalogImportService.listJobs).toHaveBeenCalledWith({
      pageNumber: 2,
      pageSize: 5,
      operationType: 'ProvisionCategories',
    })
    expect(result.data[0]?.jobId).toBe('job-categories')
    expect(store.categoryProvisioningHistory[0]?.sourceFileName).toBe('categories.json')
  })

  it('should load category attribute provisioning history from the API', async () => {
    const store = useCatalogImportStore()

    const result = await store.fetchCategoryAttributeProvisioningHistory({ pageNumber: 2, pageSize: 5 })

    expect(catalogImportService.listJobs).toHaveBeenCalledWith({
      pageNumber: 2,
      pageSize: 5,
      operationType: 'ProvisionCategoryAttributes',
    })
    expect(result.data[0]?.jobId).toBe('job-category-attributes')
    expect(store.categoryAttributeProvisioningHistory[0]?.sourceFileName).toBe('chunk-0001.json')
  })

  it('should load job detail and linked bundle detail with paginated sellers products issues and duplicate groups', async () => {
    jest.mocked(catalogImportService.getJob).mockResolvedValue(jobFixture as CatalogImportJobDetail)
    const store = useCatalogImportStore()

    await store.fetchJobDetail('job-001')

    expect(catalogImportService.getJob).toHaveBeenCalledWith('job-001')
    expect(catalogImportService.getBundleSummary).toHaveBeenCalledWith('bundle-001')
    expect(catalogImportService.listBundleSellers).toHaveBeenCalledWith('bundle-001', {
      pageNumber: 1,
      pageSize: 10,
    })
    expect(store.selectedBundleDetail.sellers.data[0]?.displayName).toBe('Tiki Trading')
    expect(store.selectedBundleDetail.products.data[0]?.title).toBe('Imported book')
    expect(store.selectedBundleDetail.validationIssues.data[0]?.severity).toBe('Blocking')
    expect(store.selectedBundleDetail.duplicateGroups.data[0]?.externalProductIds).toContain(
      '271001-copy',
    )
  })

  it('should preserve source file name on upload-created job submissions', async () => {
    jest.mocked(catalogImportService.provisionCategories).mockResolvedValue(jobFixture)
    const store = useCatalogImportStore()
    const payload: SubmitCategoryProvisioningRequest = {
      schemaVersion: '2026-07-30',
      source: { system: 'tiki', type: 'sellercenter_categories', value: 'parent:2' },
      crawl: {
        startedAt: '2026-07-30T10:00:00Z',
        completedAt: '2026-07-30T10:05:00Z',
        sourceFingerprint: 'sha256:categories',
      },
      categories: [{ externalCategoryId: '1846', name: 'Nha sach Tiki' }],
    }

    await store.provisionCategories(payload, 'categories.json')

    expect(catalogImportService.provisionCategories).toHaveBeenCalledWith(
      payload,
      'categories.json',
    )
    expect(store.uploadCreatedJob?.jobId).toBe('job-001')
    expect(catalogImportService.listJobs).toHaveBeenCalledWith({
      pageNumber: 1,
      pageSize: 10,
      operationType: 'ProvisionCategories',
    })
  })

  it('should preserve chunk file name on attribute upload-created job submissions', async () => {
    jest.mocked(catalogImportService.provisionCategoryAttributes).mockResolvedValue(
      categoryAttributeJobFixture,
    )
    const store = useCatalogImportStore()
    const payload: CategoryAttributeChunk = {
      schemaVersion: '2026-08-16',
      source: { system: 'tiki', type: 'sellercenter_category_attributes', value: 'parent:2' },
      crawl: {
        startedAt: '2026-08-16T10:00:00Z',
        completedAt: '2026-08-16T10:05:00Z',
        sourceFingerprint: 'sha256:chunk-1',
        categorySourceFingerprint: 'sha256:categories',
        checkpointId: null,
        chunkIndex: 1,
      },
      categories: [
        {
          externalCategoryId: '1846',
          productSetId: '9001',
          status: 'complete',
          attributes: [{ name: 'Brand' }],
        },
      ],
    }

    await store.provisionCategoryAttributes(payload, 'chunk-0001.json')

    expect(catalogImportService.provisionCategoryAttributes).toHaveBeenCalledWith(
      payload,
      'chunk-0001.json',
    )
    expect(store.uploadCreatedJob?.jobId).toBe('job-category-attributes')
    expect(catalogImportService.listJobs).toHaveBeenCalledWith({
      pageNumber: 1,
      pageSize: 10,
      operationType: 'ProvisionCategoryAttributes',
    })
  })

  it('should provision sellers and refresh job history', async () => {
    jest.mocked(catalogImportService.provisionSellers).mockResolvedValue({
      ...jobFixture,
      jobId: 'job-sellers',
      operationType: 'ProvisionSellers',
    })
    const store = useCatalogImportStore()

    const result = await store.provisionSellers('bundle-001')

    expect(result.operationType).toBe('ProvisionSellers')
    expect(store.activeJob?.jobId).toBe('job-sellers')
    expect(catalogImportService.listBundles).toHaveBeenCalled()
    expect(catalogImportService.listJobs).toHaveBeenCalledWith({
      pageNumber: 1,
      pageSize: 10,
      bundleId: 'bundle-001',
    })
  })

  it('should approve conflicted seller ownership and refresh bundle detail', async () => {
    jest.mocked(catalogImportService.approveSellerOwnership).mockResolvedValue({
      importedSellerId: 'imported-seller-001',
      externalSellerId: 'seller-001',
      userId: 'user-001',
      storeId: 'store-001',
      status: 'Matched',
      conflictReason: null,
    })
    const store = useCatalogImportStore()

    await store.approveSellerOwnership('bundle-001', 'imported-seller-001', {
      targetUserId: 'user-001',
      targetStoreId: 'store-001',
      approvalReason: 'Reviewed existing store',
    })

    expect(catalogImportService.approveSellerOwnership).toHaveBeenCalled()
    expect(catalogImportService.getBundleSummary).toHaveBeenCalledWith('bundle-001')
  })

  it('should load category options for category mapping', async () => {
    jest.mocked(categoryService.getCategories).mockResolvedValue([
      {
        id: 123,
        name: 'Books',
        displayName: 'Books',
        imageFileId: null,
        imageUrl: null,
      },
    ])
    const store = useCatalogImportStore()

    const result = await store.fetchCategoryOptions()

    expect(categoryService.getCategories).toHaveBeenCalled()
    expect(result[0]?.id).toBe(123)
    expect(store.categoryOptions[0]?.displayName).toBe('Books')
  })

  it('should map imported category and refresh bundle detail', async () => {
    jest.mocked(catalogImportService.mapImportedCategory).mockResolvedValue({
      bundleId: 'bundle-001',
      externalCategoryId: '1846',
      hiveSpaceCategoryId: 123,
      status: 'Mapped',
      affectedProductCount: 2,
    })
    const store = useCatalogImportStore()

    await store.mapImportedCategory('bundle-001', '1846', { hiveSpaceCategoryId: 123 })

    expect(catalogImportService.mapImportedCategory).toHaveBeenCalledWith('bundle-001', '1846', {
      hiveSpaceCategoryId: 123,
    })
    expect(catalogImportService.getBundleSummary).toHaveBeenCalledWith('bundle-001')
    expect(mockNotifySuccess).toHaveBeenCalledWith(expect.any(String), expect.any(String))
  })

  it('should treat ready and warning products as importable draft records', async () => {
    jest.mocked(catalogImportService.importReadyProducts).mockResolvedValue({
      ...jobFixture,
      jobId: 'job-import',
      operationType: 'ImportReadyProducts',
    })
    const store = useCatalogImportStore()

    await store.importReadyProducts('bundle-001', {
      productIds: ['product-001', 'product-002'],
      publicationState: 'Draft',
    })

    expect(catalogImportService.importReadyProducts).toHaveBeenCalledWith('bundle-001', {
      productIds: ['product-001', 'product-002'],
      publicationState: 'Draft',
    })
    expect(store.activeJob?.operationType).toBe('ImportReadyProducts')
  })

  it('should pass through available publication state for bundle-wide imports', async () => {
    jest.mocked(catalogImportService.importReadyProducts).mockResolvedValue({
      ...jobFixture,
      jobId: 'job-import-available',
      operationType: 'ImportReadyProducts',
    })
    const store = useCatalogImportStore()

    await store.importReadyProducts('bundle-001', {
      publicationState: 'Available',
    })

    expect(catalogImportService.importReadyProducts).toHaveBeenCalledWith('bundle-001', {
      publicationState: 'Available',
    })
  })

  it('should pass through unpublish publication state for selected imports', async () => {
    jest.mocked(catalogImportService.importReadyProducts).mockResolvedValue({
      ...jobFixture,
      jobId: 'job-import-unpublish',
      operationType: 'ImportReadyProducts',
    })
    const store = useCatalogImportStore()

    await store.importReadyProducts('bundle-001', {
      productIds: ['product-001'],
      publicationState: 'Unpublish',
    })

    expect(catalogImportService.importReadyProducts).toHaveBeenCalledWith('bundle-001', {
      productIds: ['product-001'],
      publicationState: 'Unpublish',
    })
  })

  it('should poll job status until completed and refresh affected bundle detail', async () => {
    jest.useFakeTimers()
    jest.mocked(catalogImportService.getJob).mockResolvedValue({
      ...jobFixture,
      status: 'Completed',
      completedAt: '2026-08-04T10:05:00Z',
    })
    const store = useCatalogImportStore()

    store.startPollingJob('job-001', 10)
    await jest.advanceTimersByTimeAsync(10)

    expect(catalogImportService.getJob).toHaveBeenCalledWith('job-001')
    expect(catalogImportService.getBundleSummary).toHaveBeenCalledWith('bundle-001')
    expect(catalogImportService.listBundles).toHaveBeenCalled()
    expect(store.isPolling).toBe(false)
  })

  it('should show failed job error summary without clearing existing bundle detail', async () => {
    const failedJob = {
      ...jobFixture,
      status: 'Failed',
      errorSummary: 'Tiki challenge response detected.',
    }
    const store = useCatalogImportStore()
    store.selectedBundleDetail.products = page([productFixture])
    jest.mocked(catalogImportService.getJob).mockResolvedValue(failedJob)

    const result = await store.fetchJobStatus('job-001')

    expect(result.errorSummary).toBe('Tiki challenge response detected.')
    expect(store.selectedBundleDetail.products.data[0]?.productId).toBe('product-001')
  })
})

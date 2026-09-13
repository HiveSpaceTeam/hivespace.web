import { beforeEach, describe, expect, it, jest } from '@jest/globals'

const mockGet = jest.fn<() => Promise<unknown>>()
const mockPost = jest.fn<() => Promise<unknown>>()

jest.mock('./base.service', () => ({
  BaseService: class {
    get = mockGet
    post = mockPost
  },
}))

import { catalogImportService } from './catalog-import.service'

describe('catalogImportService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should submit category output with source file name metadata', async () => {
    mockPost.mockResolvedValue({
      jobId: 'job-001',
      status: 'Pending',
      operationType: 'ProvisionCategories',
      sourceFileName: 'categories.json',
    })
    const payload = {
      schemaVersion: '2026-07-30',
      source: { system: 'tiki', type: 'sellercenter_categories', value: 'parent:2' },
      crawl: {
        startedAt: '2026-07-30T10:00:00Z',
        completedAt: '2026-07-30T10:05:00Z',
        sourceFingerprint: 'sha256:categories',
      },
      categories: [{ externalCategoryId: '1846', name: 'Nha sach Tiki' }],
    }

    await catalogImportService.provisionCategories(payload, 'categories.json')

    expect(mockPost).toHaveBeenCalledWith(
      '/admins/catalog-imports/categories/provisioning',
      payload,
      { headers: { 'X-Source-File-Name': 'categories.json' } },
    )
  })

  it('should submit one category attribute chunk with chunk file name metadata', async () => {
    mockPost.mockResolvedValue({
      jobId: 'job-attributes',
      status: 'Pending',
      operationType: 'ProvisionCategoryAttributes',
      sourceFileName: 'chunk-0001.json',
    })
    const payload = {
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

    await catalogImportService.provisionCategoryAttributes(payload, 'chunk-0001.json')

    expect(mockPost).toHaveBeenCalledWith(
      '/admins/catalog-imports/categories/attributes/provisioning',
      payload,
      { headers: { 'X-Source-File-Name': 'chunk-0001.json' } },
    )
  })

  it('should load paginated job history from the all-operation endpoint', async () => {
    mockGet.mockResolvedValue({ data: [], pagination: { currentPage: 1 } })

    await catalogImportService.listJobs({ pageNumber: 2, pageSize: 20, status: 'Running' })

    expect(mockGet).toHaveBeenCalledWith('/admins/catalog-imports/jobs', {
      params: { pageNumber: 2, pageSize: 20, status: 'Running' },
    })
  })

  it('should load paginated bundle history from the bundle endpoint', async () => {
    mockGet.mockResolvedValue({ data: [], pagination: { currentPage: 1 } })

    await catalogImportService.listBundles({ pageNumber: 3, pageSize: 15 })

    expect(mockGet).toHaveBeenCalledWith('/admins/catalog-imports/bundles', {
      params: { pageNumber: 3, pageSize: 15 },
    })
  })

  it('should call paginated bundle section endpoints', async () => {
    mockGet.mockResolvedValue({ data: [], pagination: { currentPage: 1 } })

    await catalogImportService.listBundleSellers('bundle-001', {
      pageNumber: 3,
      pageSize: 10,
      searchTerm: 'seller-001',
    })
    await catalogImportService.listBundleProducts('bundle-001', {
      readinessStatus: 'Ready',
      searchTerm: '271001',
    })
    await catalogImportService.listBundleValidationIssues('bundle-001', {
      severity: 'Blocking',
      searchTerm: 'MissingCategory',
    })
    await catalogImportService.listBundleCategoryLinks('bundle-001', { searchTerm: '1846' })
    await catalogImportService.listBundleDuplicateGroups('bundle-001', {
      searchTerm: 'product-001',
    })

    expect(mockGet).toHaveBeenCalledWith('/admins/catalog-imports/bundles/bundle-001/sellers', {
      params: { pageNumber: 3, pageSize: 10, searchTerm: 'seller-001' },
    })
    expect(mockGet).toHaveBeenCalledWith('/admins/catalog-imports/bundles/bundle-001/products', {
      params: { readinessStatus: 'Ready', searchTerm: '271001' },
    })
    expect(mockGet).toHaveBeenCalledWith(
      '/admins/catalog-imports/bundles/bundle-001/category-links',
      { params: { searchTerm: '1846' } },
    )
    expect(mockGet).toHaveBeenCalledWith(
      '/admins/catalog-imports/bundles/bundle-001/duplicate-groups',
      { params: { searchTerm: 'product-001' } },
    )
    expect(mockGet).toHaveBeenCalledWith(
      '/admins/catalog-imports/bundles/bundle-001/validation-issues',
      { params: { severity: 'Blocking', searchTerm: 'MissingCategory' } },
    )
  })

  it('should approve seller ownership through CatalogService only', async () => {
    mockPost.mockResolvedValue({ importedSellerId: 'seller-row-001', status: 'Matched' })

    await catalogImportService.approveSellerOwnership('bundle-001', 'seller-row-001', {
      targetUserId: 'user-001',
      targetStoreId: 'store-001',
      approvalReason: 'Reviewed existing store',
    })

    expect(mockPost).toHaveBeenCalledWith(
      '/admins/catalog-imports/bundles/bundle-001/sellers/seller-row-001/ownership-link',
      {
        targetUserId: 'user-001',
        targetStoreId: 'store-001',
        approvalReason: 'Reviewed existing store',
      },
    )
  })

  it('should map imported category links with encoded external category id', async () => {
    mockPost.mockResolvedValue({
      bundleId: 'bundle-001',
      externalCategoryId: '1846/child',
      hiveSpaceCategoryId: 123,
      status: 'Mapped',
      affectedProductCount: 2,
    })

    await catalogImportService.mapImportedCategory('bundle-001', '1846/child', {
      hiveSpaceCategoryId: 123,
    })

    expect(mockPost).toHaveBeenCalledWith(
      '/admins/catalog-imports/bundles/bundle-001/category-links/1846%2Fchild/mapping',
      { hiveSpaceCategoryId: 123 },
    )
  })

  it('should treat workflow actions as job submissions', async () => {
    mockPost.mockResolvedValue({ jobId: 'job-002', status: 'Pending' })

    await catalogImportService.validateBundle('bundle-001')
    await catalogImportService.provisionSellers('bundle-001')
    await catalogImportService.importReadyProducts('bundle-001', {
      productIds: ['product-001'],
      publicationState: 'Draft',
    })

    expect(mockPost).toHaveBeenCalledWith(
      '/admins/catalog-imports/bundles/bundle-001/validate',
    )
    expect(mockPost).toHaveBeenCalledWith(
      '/admins/catalog-imports/bundles/bundle-001/seller-provisioning',
    )
    expect(mockPost).toHaveBeenCalledWith('/admins/catalog-imports/bundles/bundle-001/import', {
      productIds: ['product-001'],
      publicationState: 'Draft',
    })
  })

  it('should allow bundle-wide import requests without product ids', async () => {
    mockPost.mockResolvedValue({ jobId: 'job-003', status: 'Pending' })

    await catalogImportService.importReadyProducts('bundle-001', {
      publicationState: 'Draft',
    })

    expect(mockPost).toHaveBeenCalledWith('/admins/catalog-imports/bundles/bundle-001/import', {
      publicationState: 'Draft',
    })
  })

  it('should pass through available publication state for ready-product imports', async () => {
    mockPost.mockResolvedValue({ jobId: 'job-004', status: 'Pending' })

    await catalogImportService.importReadyProducts('bundle-001', {
      publicationState: 'Available',
    })

    expect(mockPost).toHaveBeenCalledWith('/admins/catalog-imports/bundles/bundle-001/import', {
      publicationState: 'Available',
    })
  })

  it('should pass through unpublish publication state for selected ready-product imports', async () => {
    mockPost.mockResolvedValue({ jobId: 'job-005', status: 'Pending' })

    await catalogImportService.importReadyProducts('bundle-001', {
      productIds: ['product-001'],
      publicationState: 'Unpublish',
    })

    expect(mockPost).toHaveBeenCalledWith('/admins/catalog-imports/bundles/bundle-001/import', {
      productIds: ['product-001'],
      publicationState: 'Unpublish',
    })
  })
})

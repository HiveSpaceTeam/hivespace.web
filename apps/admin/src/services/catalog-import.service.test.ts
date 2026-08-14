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

    await catalogImportService.listBundleSellers('bundle-001', { pageNumber: 3, pageSize: 10 })
    await catalogImportService.listBundleProducts('bundle-001', { readinessStatus: 'Ready' })
    await catalogImportService.listBundleValidationIssues('bundle-001', { severity: 'Blocking' })

    expect(mockGet).toHaveBeenCalledWith('/admins/catalog-imports/bundles/bundle-001/sellers', {
      params: { pageNumber: 3, pageSize: 10 },
    })
    expect(mockGet).toHaveBeenCalledWith('/admins/catalog-imports/bundles/bundle-001/products', {
      params: { readinessStatus: 'Ready' },
    })
    expect(mockGet).toHaveBeenCalledWith(
      '/admins/catalog-imports/bundles/bundle-001/validation-issues',
      { params: { severity: 'Blocking' } },
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
})

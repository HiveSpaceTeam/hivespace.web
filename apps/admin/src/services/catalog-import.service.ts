import type {
  ApproveSellerOwnershipRequest,
  CatalogImportBundleQuery,
  BundleCategoryLinksQuery,
  BundleDuplicateGroupsQuery,
  BundleProductsQuery,
  BundleSellersQuery,
  BundleValidationIssuesQuery,
  CatalogImportBundleSummary,
  CatalogImportDuplicateGroup,
  CatalogImportJobDetail,
  CatalogImportJobHistoryRow,
  CatalogImportJobQuery,
  CatalogImportJobSubmission,
  CatalogImportPaginatedResponse,
  CatalogImportValidationIssue,
  ImportReadyCatalogProductsRequest,
  ImportedProduct,
  ImportedSeller,
  MapImportedCategoryRequest,
  MapImportedCategoryResult,
  ProvisionedCategoryLink,
  SellerOwnershipApprovalResponse,
  CategoryAttributeChunk,
  SubmitCategoryProvisioningRequest,
  SubmitCatalogImportBundleRequest,
} from '@/types'
import { BaseService } from './base.service'

const sourceFileHeader = (sourceFileName?: string | null) =>
  sourceFileName
    ? {
        headers: {
          'X-Source-File-Name': sourceFileName,
        },
      }
    : undefined

class CatalogImportService extends BaseService {
  provisionCategories(
    payload: SubmitCategoryProvisioningRequest,
    sourceFileName?: string | null,
  ): Promise<CatalogImportJobSubmission> {
    return this.post<CatalogImportJobSubmission>(
      '/admins/catalog-imports/categories/provisioning',
      payload,
      sourceFileHeader(sourceFileName),
    )
  }

  provisionCategoryAttributes(
    payload: CategoryAttributeChunk,
    sourceFileName?: string | null,
  ): Promise<CatalogImportJobSubmission> {
    return this.post<CatalogImportJobSubmission>(
      '/admins/catalog-imports/categories/attributes/provisioning',
      payload,
      sourceFileHeader(sourceFileName),
    )
  }

  submitBundle(
    payload: SubmitCatalogImportBundleRequest,
    sourceFileName?: string | null,
  ): Promise<CatalogImportJobSubmission> {
    return this.post<CatalogImportJobSubmission>(
      '/admins/catalog-imports/bundles',
      payload,
      sourceFileHeader(sourceFileName),
    )
  }

  listJobs(
    query: CatalogImportJobQuery = {},
  ): Promise<CatalogImportPaginatedResponse<CatalogImportJobHistoryRow>> {
    return this.get<CatalogImportPaginatedResponse<CatalogImportJobHistoryRow>>(
      '/admins/catalog-imports/jobs',
      { params: query },
    )
  }

  listBundles(
    query: CatalogImportBundleQuery = {},
  ): Promise<CatalogImportPaginatedResponse<CatalogImportBundleSummary>> {
    return this.get<CatalogImportPaginatedResponse<CatalogImportBundleSummary>>(
      '/admins/catalog-imports/bundles',
      { params: query },
    )
  }

  getJob(jobId: string): Promise<CatalogImportJobDetail> {
    return this.get<CatalogImportJobDetail>(`/admins/catalog-imports/jobs/${jobId}`)
  }

  getBundleSummary(bundleId: string): Promise<CatalogImportBundleSummary> {
    return this.get<CatalogImportBundleSummary>(`/admins/catalog-imports/bundles/${bundleId}`)
  }

  listBundleCategoryLinks(
    bundleId: string,
    query: BundleCategoryLinksQuery = {},
  ): Promise<CatalogImportPaginatedResponse<ProvisionedCategoryLink>> {
    return this.get<CatalogImportPaginatedResponse<ProvisionedCategoryLink>>(
      `/admins/catalog-imports/bundles/${bundleId}/category-links`,
      { params: query },
    )
  }

  listBundleSellers(
    bundleId: string,
    query: BundleSellersQuery = {},
  ): Promise<CatalogImportPaginatedResponse<ImportedSeller>> {
    return this.get<CatalogImportPaginatedResponse<ImportedSeller>>(
      `/admins/catalog-imports/bundles/${bundleId}/sellers`,
      { params: query },
    )
  }

  listBundleProducts(
    bundleId: string,
    query: BundleProductsQuery = {},
  ): Promise<CatalogImportPaginatedResponse<ImportedProduct>> {
    return this.get<CatalogImportPaginatedResponse<ImportedProduct>>(
      `/admins/catalog-imports/bundles/${bundleId}/products`,
      { params: query },
    )
  }

  listBundleDuplicateGroups(
    bundleId: string,
    query: BundleDuplicateGroupsQuery = {},
  ): Promise<CatalogImportPaginatedResponse<CatalogImportDuplicateGroup>> {
    return this.get<CatalogImportPaginatedResponse<CatalogImportDuplicateGroup>>(
      `/admins/catalog-imports/bundles/${bundleId}/duplicate-groups`,
      { params: query },
    )
  }

  listBundleValidationIssues(
    bundleId: string,
    query: BundleValidationIssuesQuery = {},
  ): Promise<CatalogImportPaginatedResponse<CatalogImportValidationIssue>> {
    return this.get<CatalogImportPaginatedResponse<CatalogImportValidationIssue>>(
      `/admins/catalog-imports/bundles/${bundleId}/validation-issues`,
      { params: query },
    )
  }

  validateBundle(bundleId: string): Promise<CatalogImportJobSubmission> {
    return this.post<CatalogImportJobSubmission>(
      `/admins/catalog-imports/bundles/${bundleId}/validate`,
    )
  }

  provisionSellers(bundleId: string): Promise<CatalogImportJobSubmission> {
    return this.post<CatalogImportJobSubmission>(
      `/admins/catalog-imports/bundles/${bundleId}/seller-provisioning`,
    )
  }

  approveSellerOwnership(
    bundleId: string,
    importedSellerId: string,
    payload: ApproveSellerOwnershipRequest,
  ): Promise<SellerOwnershipApprovalResponse> {
    return this.post<SellerOwnershipApprovalResponse>(
      `/admins/catalog-imports/bundles/${bundleId}/sellers/${importedSellerId}/ownership-link`,
      payload,
    )
  }

  mapImportedCategory(
    bundleId: string,
    externalCategoryId: string,
    payload: MapImportedCategoryRequest,
  ): Promise<MapImportedCategoryResult> {
    return this.post<MapImportedCategoryResult>(
      `/admins/catalog-imports/bundles/${bundleId}/category-links/${encodeURIComponent(
        externalCategoryId,
      )}/mapping`,
      payload,
    )
  }

  importReadyProducts(
    bundleId: string,
    payload: ImportReadyCatalogProductsRequest,
  ): Promise<CatalogImportJobSubmission> {
    return this.post<CatalogImportJobSubmission>(
      `/admins/catalog-imports/bundles/${bundleId}/import`,
      payload,
    )
  }

  retryJob(jobId: string): Promise<CatalogImportJobSubmission> {
    return this.post<CatalogImportJobSubmission>(`/admins/catalog-imports/jobs/${jobId}/retry`)
  }
}

export const catalogImportService = new CatalogImportService()

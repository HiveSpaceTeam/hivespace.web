import type { PaginationMetadata } from '@hivespace/shared'

export type CatalogImportSourceSystem = 'tiki' | string
export type CatalogImportSourceType =
  | 'category'
  | 'search'
  | 'product-list'
  | 'sellercenter_categories'
  | string
export type CatalogImportJobStatus = 'Pending' | 'Running' | 'Completed' | 'Failed' | string
export type CatalogImportOperationType =
  | 'ProvisionCategories'
  | 'SubmitBundle'
  | 'ValidateBundle'
  | 'ProvisionSellers'
  | 'ImportReadyProducts'
  | string
export type CatalogImportBundleStatus =
  | 'Submitted'
  | 'NeedsAttention'
  | 'Validated'
  | 'Imported'
  | string
export type CatalogImportIssueSeverity = 'Warning' | 'Blocking'
export type CatalogImportReadinessStatus = 'Ready' | 'Warning' | 'Blocked' | string
export type CatalogImportProductImportStatus =
  | 'Pending'
  | 'Imported'
  | 'Skipped'
  | 'Blocked'
  | 'Failed'
  | string
export type ImportedSellerStatus = 'Pending' | 'Created' | 'Matched' | 'Conflict' | 'Failed' | string
export type ProvisionedCategoryLinkStatus = 'Created' | 'Matched' | 'Conflict' | 'Failed' | string
export type ImportedImageRole = 'Thumbnail' | 'ProductImage' | 'SkuImage' | string
export type CatalogImportPublicationState = 'Draft'

export interface CatalogImportSource {
  system: CatalogImportSourceSystem
  type: CatalogImportSourceType
  value: string
  url?: string | null
}

export interface CatalogImportCrawl {
  startedAt: string
  completedAt: string
  sourceFingerprint: string
  checkpointId?: string | null
}

export interface CatalogImportPageQuery {
  pageNumber?: number
  pageSize?: number
}

export interface CatalogImportBundleQuery extends CatalogImportPageQuery {}

export interface CatalogImportPaginatedResponse<T> {
  data: T[]
  pagination: PaginationMetadata
}

export interface CatalogImportJobQuery extends CatalogImportPageQuery {
  status?: CatalogImportJobStatus
  operationType?: CatalogImportOperationType
  sourceSystem?: CatalogImportSourceSystem
  bundleId?: string
  requestedFrom?: string
  requestedTo?: string
}

export interface CatalogImportJobProgress {
  total: number
  processed: number
  created?: number
  matched?: number
  failed?: number
  conflict?: number
  imported?: number
  skipped?: number
  blocked?: number
}

export interface CatalogImportOperationSummary {
  totalCategories?: number
  totalProducts?: number
  readyProducts?: number
  blockedProducts?: number
  warningCount?: number
  duplicateCount?: number
  created?: number
  matched?: number
  failed?: number
  conflict?: number
  imported?: number
  skipped?: number
  blocked?: number
}

export interface CatalogImportJobSubmission {
  jobId: string
  status: CatalogImportJobStatus
  operationType: CatalogImportOperationType
  sourceFingerprint?: string | null
  sourceFileName?: string | null
  bundleId?: string | null
}

export interface CatalogImportJobHistoryRow extends CatalogImportJobSubmission {
  sourceSystem?: CatalogImportSourceSystem | null
  requestedByUserId?: string | null
  requestedAt: string
  startedAt?: string | null
  completedAt?: string | null
  progress?: CatalogImportJobProgress | null
  resultSummary?: CatalogImportOperationSummary | null
  errorSummary?: string | null
}

export interface CatalogImportJobDetail extends CatalogImportJobHistoryRow {}

export interface CatalogImportSummary {
  totalProducts: number
  readyProducts: number
  blockedProducts: number
  warningCount: number
  duplicateCount: number
}

export interface CatalogImportBundleSummary {
  bundleId: string
  status: CatalogImportBundleStatus
  source: CatalogImportSource
  crawl: CatalogImportCrawl
  sourceFileName?: string | null
  summary: CatalogImportSummary
  submittedBy?: string | null
  submittedAt?: string | null
}

export interface ExistingStoreCandidate {
  userId: string
  storeId: string
  storeName: string
  reason?: string | null
}

export interface ImportedSeller {
  importedSellerId?: string | null
  externalSellerId: string
  displayName: string
  slug?: string | null
  url?: string | null
  metadata?: Record<string, unknown>
  status?: ImportedSellerStatus
  conflictReason?: string | null
  userId?: string | null
  storeId?: string | null
  existingStoreCandidates?: ExistingStoreCandidate[]
  requiresValidationRerun?: boolean
}

export interface CategoryProvisioningCategory {
  externalCategoryId: string
  externalParentCategoryId?: string | null
  name: string
  path?: string[]
  productSetId?: string | null
  imageUrl?: string | null
  imageFileId?: string | null
  metadata?: Record<string, unknown>
}

export interface SubmitCategoryProvisioningRequest {
  schemaVersion: string
  source: CatalogImportSource
  crawl: CatalogImportCrawl
  categories: CategoryProvisioningCategory[]
}

export interface ProvisionedCategoryLink {
  externalCategoryId: string
  categoryId?: string | null
  categoryName?: string | null
  status: ProvisionedCategoryLinkStatus
  conflictReason?: string | null
}

export interface ImportedAttribute {
  name: string
  value: string
  sourceAttributeId?: string | null
}

export interface ImportedImageReference {
  url: string
  role: ImportedImageRole
  sourceImageId?: string | null
}

export interface ImportedVariant {
  name: string
  values: string[]
}

export interface ImportedSkuPrice {
  amount: number
  currencyCode: string
  sourceRawValue?: string | null
}

export interface ImportedSku {
  skuId?: string | null
  externalSkuId: string
  skuNumber?: string | null
  variantSelections: Record<string, string>
  price: ImportedSkuPrice
  stockQuantity?: number | null
  imageUrls?: string[]
  readinessStatus?: CatalogImportReadinessStatus
}

export interface ImportedProduct {
  productId: string
  externalProductId: string
  externalSellerId: string
  externalCategoryIds?: string[] | null
  url?: string | null
  title: string
  description?: string | null
  thumbnailUrl?: string | null
  readinessStatus: CatalogImportReadinessStatus
  importStatus?: CatalogImportProductImportStatus
  attributes?: ImportedAttribute[] | null
  images?: ImportedImageReference[] | null
  variants?: ImportedVariant[] | null
  skus?: ImportedSku[] | null
}

export interface CatalogImportValidationIssue {
  issueId?: string | null
  entityType: string
  entitySourceId: string
  field?: string | null
  severity: CatalogImportIssueSeverity
  reasonCode: string
  message?: string | null
}

export interface CatalogImportDuplicateGroup {
  groupId: string
  externalProductIds: string[]
  canonicalExternalProductId?: string | null
  reasonCode: string
  resolutionStatus?: string | null
}

export interface CatalogImportBundleDetail {
  bundle: CatalogImportBundleSummary | null
  categoryLinks: CatalogImportPaginatedResponse<ProvisionedCategoryLink>
  sellers: CatalogImportPaginatedResponse<ImportedSeller>
  products: CatalogImportPaginatedResponse<ImportedProduct>
  duplicateGroups: CatalogImportPaginatedResponse<CatalogImportDuplicateGroup>
  validationIssues: CatalogImportPaginatedResponse<CatalogImportValidationIssue>
}

export interface SubmitCatalogImportBundleRequest {
  schemaVersion: string
  source: CatalogImportSource
  crawl: CatalogImportCrawl
  sellers: ImportedSeller[]
  products: Array<
    Omit<ImportedProduct, 'productId' | 'readinessStatus'> & {
      productId?: string
      readinessStatus?: CatalogImportReadinessStatus
    }
  >
  validationHints: CatalogImportValidationIssue[]
}

export interface BundleCategoryLinksQuery extends CatalogImportPageQuery {
  status?: ProvisionedCategoryLinkStatus
}

export interface BundleSellersQuery extends CatalogImportPageQuery {
  provisioningStatus?: ImportedSellerStatus
}

export interface BundleProductsQuery extends CatalogImportPageQuery {
  readinessStatus?: CatalogImportReadinessStatus
  importStatus?: CatalogImportProductImportStatus
  sellerId?: string
}

export interface BundleDuplicateGroupsQuery extends CatalogImportPageQuery {
  resolutionStatus?: string
}

export interface BundleValidationIssuesQuery extends CatalogImportPageQuery {
  severity?: CatalogImportIssueSeverity
  entityType?: string
  reasonCode?: string
}

export interface ApproveSellerOwnershipRequest {
  targetUserId: string
  targetStoreId: string
  approvalReason: string
}

export interface SellerOwnershipApprovalResponse {
  importedSellerId: string
  externalSellerId: string
  userId: string
  storeId: string
  status: ImportedSellerStatus
  conflictReason?: string | null
}

export interface ImportReadyCatalogProductsRequest {
  productIds?: string[]
  publicationState: CatalogImportPublicationState
}

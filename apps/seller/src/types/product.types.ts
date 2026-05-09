import type { PaginationMetadata } from '@hivespace/shared'

// Product-related types
export interface ProductVariantOption {
  optionId: string
  value: string
}

export interface ProductVariant {
  id: number // Using UUID string
  name: string
  options: ProductVariantOption[]
}

export interface ProductSkuImage {
  skuId: string
  fileId: string
}

export interface ProductImage {
  skuId?: string
  fileId: string
  imageUrl: string | null
}

export interface ProductSku {
  id?: number // Keep for backward compatibility
  key?: string // New composite key based on variant combinations
  skuVariants: {
    variantName: string
    value: string
    optionId: string
  }[]
  price: { amount: number; currency: number }
  quantity?: number | string
  skuNo?: string
  imageFileName?: string
  images?: ProductSkuImage[]
}

export interface CurrentSeller {
  id: string
  storeName: string
  logoUrl: string | null
}

export interface Product {
  id?: number
  name: string
  category: string
  description?: string
  variants: ProductVariant[]
  skus: ProductSku[]
  images?: ProductImage[]
  thumbnailUrl: string | null
  currentSeller: CurrentSeller | null
}

// Search/paging contracts
export interface GetProductListQuery {
  keyword?: string
  sort?: 'ASC' | 'DESC'
  pageSize: number
  page: number
}

export interface GetProductListResponse {
  items: Product[]
  pagination: PaginationMetadata
}

export interface CreateProductRequest {
  name: string
  category: string
  description?: string
  variants: ProductVariant[]
  skus: ProductSku[]
  // Add more fields as needed
  attributes?: ProductAttributeSelection[]
}

export interface CreateProductResponse {
  id: string
  name: string
  category: string
  description?: string
  productVariants: ProductVariant[]
  productSkus: ProductSku[]
  createdAt: string
  updatedAt?: string
  thumbnailUrl: string | null
  currentSeller: CurrentSeller | null
}

// Update request shares the same payload shape as create for now
export type UpdateProductRequest = CreateProductRequest

// Category-related types
export interface Category {
  id: string
  name: string
  displayName: string
  imageFileId: string | null
  imageUrl: string | null
}

export interface CategoryAttribute {
  id: string
  name: string
  valueType: number
  inputType: number
  isMandatory: boolean
  maxValueCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  values?: CategoryAttributeValue[]
}

export interface GetCategoryListResponse {
  categories: Category[]
  totalCount?: number
}

export interface CategoryAttributeValue {
  id: string
  attributeId: string
  name: string
  displayName: string
  parentValueId: string | null
  isActive: boolean
  sortOrder: number
}

// Payload for selected attribute values when creating/updating a product
export interface ProductAttributeSelection {
  attributeId: string
  selectedValueIds?: string[]
  freeTextValue?: string | null
}

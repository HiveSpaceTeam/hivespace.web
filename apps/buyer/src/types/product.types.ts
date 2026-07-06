import type { MoneyIssue, SupportedCurrencyCode } from '@hivespace/shared'
import type { PaginationMetadata } from '@hivespace/shared'

export interface ProductVariantOption {
  value: string
}

export interface ProductVariant {
  id: string // Using UUID string
  name: string
  options: ProductVariantOption[]
}

export interface ProductSkuImage {
  skuId?: string
  fileId: string
  imageUrl: string | null
}

export interface ProductImage {
  skuId?: string
  fileId: string
  imageUrl: string | null
}

export interface ProductSku {
  id?: number
  key?: string
  skuName?: string
  price: {
    amount: number
    currency?: number | string
    currencyCode?: SupportedCurrencyCode | null
    issue?: MoneyIssue | null
  }
  quantity?: number | string
  skuNo?: string
  isActive?: boolean
  attributes?: string | null
  imageFileName?: string
  images?: ProductSkuImage[]
}

export interface ProductAttribute {
  attributeId: number
  attributeName: string
  groupId?: number
  groupName?: string
  selectedValueIds: number[]
  freeTextValue?: string
  nameValue: string[]
}

export interface CurrentSeller {
  id: string
  storeName: string
  logoUrl: string | null
}

export interface ProductSummary {
  id: string
  name: string
  price: number
  priceCurrencyCode?: SupportedCurrencyCode | null
  priceIssue?: MoneyIssue | null
  originalPrice?: number
  productImage: string | null
  soldCount: number
  rating: number
  discountPercentage?: number
  isMall?: boolean
  isPreferred?: boolean
  isFreeShipping?: boolean
  isVoucher?: boolean
  imageURL?: string
}

export interface GetProductListQuery {
  pageSize: number
  page: number
}

export interface GetProductListResponse {
  items: ProductSummary[]
  pagination: PaginationMetadata
}

export interface GetProductDetailResponse {
  id?: number
  sellerId?: string
  name: string
  category?: string
  categories?: {
    categoryId: number
  }[]
  description?: string
  variants: ProductVariant[]
  skus: ProductSku[]
  images?: ProductImage[]
  attributes: ProductAttribute[]
  thumbnailUrl: string | null
  currentSeller: CurrentSeller | null
}

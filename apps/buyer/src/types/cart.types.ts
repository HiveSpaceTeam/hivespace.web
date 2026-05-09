import type { PaginationMetadata } from '@hivespace/shared'

// Cart UI types

export interface CartItem {
  id: string
  cartItemId: string
  skuId: number
  name: string
  image: string
  price: number
  originalPrice?: number
  quantity: number
  variant?: string
  selected: boolean
  isFreeShipping?: boolean
  isReturn?: boolean
}

export interface CartGroup {
  sellerName: string
  isMall: boolean
  selected: boolean
  items: CartItem[]
}

// Cart API types

export interface CartItemResponse {
  cartItemId: string
  productId: number
  skuId: number
  quantity: number
  isSelected: boolean
  productName: string
  productThumbnailUrl: string
  productStatus: number
  price: number
  currency: string
  skuNo: string
  skuImageUrl: string
  skuAttributes: string
  storeName: string
  storeStatus: number
  createdAt: string
  updatedAt: string
}

export interface GetCartItemsResponse {
  items: CartItemResponse[]
  pagination: PaginationMetadata
}

export interface AddCartItemRequest {
  productId: number
  skuId: number
  quantity: number
}

export interface AddCartItemResponse {
  cartItemId: string
}

export interface UpdateCartItemPayload {
  cartItemId: string
  skuId: number
  quantity: number
  isSelected: boolean
}

export interface UpdateCartItemsRequest {
  selectAll: boolean | null
  items: UpdateCartItemPayload[]
}

export interface GetSelectedItemsCountResponse {
  count: number
}


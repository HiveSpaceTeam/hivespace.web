export interface AppliedPlatformCoupon {
  couponCode: string
}

export interface AppliedStoreCoupon {
  storeId: string
  couponCode: string
}

export interface InvalidAppliedCoupon {
  couponCode: string
  ownerType: 'Platform' | 'Store'
  storeId?: string | null
  reasonCode: string
  message: string
}

export interface CartItem {
  id: string
  cartItemId: string
  productId: number
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
  storeId: string
  storeName: string
  storeStatus?: number | null
  isMall: boolean
  selected: boolean
  appliedStoreCoupon?: AppliedStoreCoupon | null
  items: CartItem[]
}

export interface CartItemResponse {
  cartItemId: string
  productId: number
  skuId: number
  quantity: number
  isSelected: boolean
  productName: string | null
  productThumbnailUrl: string | null
  productStatus: number | null
  originalPrice?: number | null
  price: number | null
  currency: string | null
  skuNo: string | null
  skuName?: string | null
  skuImageUrl: string | null
  skuAttributes: string | null
  storeId: string
  storeName: string | null
  storeStatus: number | null
  createdAt: string
  updatedAt: string | null
}

export interface CartStoreGroupResponse {
  storeId: string
  storeName: string
  storeStatus?: number | null
  isMall: boolean
  isSelected: boolean
  appliedStoreCoupon?: AppliedStoreCoupon | null
  items: CartItemResponse[]
}

export interface CartSummary {
  discountAmount: number
  subTotal: number
  total: number
}

export interface GetCartSummaryRequest {
  page: number
  pageSize: number
}

export interface GetCartSummaryResponse {
  stores: CartStoreGroupResponse[]
  summary: CartSummary
  platformCoupons: AppliedPlatformCoupon[]
  invalidatedCoupons: InvalidAppliedCoupon[]
  hasMore: boolean
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

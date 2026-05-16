import type { CouponScope, DiscountType } from '@hivespace/shared'

export interface AvailableCoupon {
  id?: string
  code: string
  name?: string
  startDateTime?: string
  endDateTime?: string
  discountType?: DiscountType
  discountAmount?: number | null
  discountCurrency?: string
  discountPercentage: number
  maxDiscountAmount?: number | null
  minOrderAmount: number
  scope?: CouponScope
  isApplicable?: boolean
  isExpired?: boolean
}

export interface AvailableCouponStore {
  storeId: string
  storeName: string
  storeLogoUrl: string | null
  coupons: AvailableCoupon[]
}

export type GetAvailableCouponsResponse = AvailableCouponStore

// ============================================================
// Marketing Domain - Coupon Types
// Mirrors the backend HiveSpace.OrderService domain contracts
// ============================================================
import type { PaginationMetadata } from '@hivespace/shared'

/** Front-end coupon category selection enum */
export enum CouponType {
    ENTIRE_SHOP = 1,
    SPECIFIC_PRODUCTS = 2,
    PRIVATE = 3,
}

/** Mirrors backend DiscountType enum */
export enum DiscountType {
    FixedAmount = 1,
    Percentage = 2,
}

/** Mirrors backend CouponScope enum */
export enum CouponScope {
    ShippingFee = 1,
    ItemPrice = 2,
}

export enum CouponStatus {
    All = 0,
    Ongoing = 1,
    Upcoming = 2,
    Expired = 3,
}

/** Reward type for coupon discount */
export enum RewardType {
    Discount = 'discount',
    Coin = 'coin',
}

// ─── Request ────────────────────────────────────────────────

/**
 * Request payload for POST /api/v1/coupons
 * Mirrors CreateCouponCommand on the backend.
 */
export interface CreateCouponRequest {
    code: string
    name: string
    startDateTime: string // ISO 8601
    endDateTime: string // ISO 8601
    earlySaveDateTime?: string | null // ISO 8601

    discountType: DiscountType
    discountAmount?: number | null
    discountCurrency: string
    discountPercentage?: number | null
    maxDiscountAmount?: number | null
    minOrderAmount: number

    scope: CouponScope

    maxUsageCount: number
    maxUsagePerUser: number

    isHidden: boolean

    applicableProductIds: number[]
    applicableCategoryIds: number[]
}

/**
 * Request payload for PUT /api/v1/coupons/:id
 * Mirrors UpdateCouponCommand on the backend.
 */
export interface UpdateCouponRequest {
    id: string
    code: string
    name: string
    startDateTime: string
    endDateTime: string
    earlySaveDateTime?: string | null

    discountCurrency: string
    discountAmount?: number | null
    discountPercentage?: number | null
    maxDiscountAmount?: number | null
    minOrderAmount: number

    maxUsageCount: number

    applicableProductIds: number[]
}

/**
 * Filter parameters for fetching a paginated list of coupons.
 * Mirrors GetCouponListQuery on the backend.
 */
export interface GetCouponListQuery {
    couponStatus: CouponStatus
    page: number
    pageSize: number
    couponName?: string
    couponCode?: string
}

// ─── Response ───────────────────────────────────────────────

/**
/**
 * Full coupon DTO — used by detail/create endpoints.
 * Mirrors CouponDto on the backend.
 */
export interface CouponDto {
    id: string
    code: string
    name: string
    startDateTime: string
    endDateTime: string
    earlySaveDateTime?: string | null

    discountType: DiscountType
    discountAmount?: number | null
    discountCurrency?: string | null
    discountPercentage?: number | null
    maxDiscountAmount?: number | null
    minOrderAmount: number

    scope: CouponScope

    maxUsageCount: number
    currentUsageCount: number
    maxUsagePerUser: number

    isHidden: boolean
    ownerType: number
    createdBy: string
    isActive: boolean
    status: CouponStatus

    createdAt: string
    updatedAt?: string | null

    applicableProductIds: number[]
    storeId?: string | null
    applicableCategoryIds: number[]
}

/**
 * Lean DTO returned by the coupon list endpoint.
 * Mirrors CouponSummaryDto on the backend.
 */
export interface CouponSummaryDto {
    id: string
    code: string
    name: string
    startDateTime: string
    endDateTime: string

    discountType: DiscountType
    discountAmount?: number | null
    discountCurrency: string
    discountPercentage?: number | null
    maxDiscountAmount?: number | null
    minOrderAmount: number

    maxUsageCount: number
    currentUsageCount: number

    isHidden: boolean
    isActive: boolean
    status: CouponStatus

    applicableProductIds: number[]
}

export interface GetCouponListResponse {
    coupons: CouponSummaryDto[]
    pagination: PaginationMetadata
}

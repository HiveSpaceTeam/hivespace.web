import type {
  CreateCouponRequest,
  UpdateCouponRequest,
  CouponDto,
  GetCouponListQuery,
  GetCouponListResponse,
} from '@/types'
import { apiService } from './api'
import { buildApiUrl } from '@/config'

// ────────────────────────────────────────────────────────────
// Coupon Service
// Handles all HTTP interactions with the Order Service coupon
// endpoints routed through the API gateway.
// ────────────────────────────────────────────────────────────

const COUPON_ENDPOINTS = {
    COUPONS: '/coupons',
} as const

class CouponService {
    /**
     * Create a new coupon.
     * POST /api/v1/coupons
     * Returns the created CouponDto (HTTP 201 Created).
     */
    async createCoupon(payload: CreateCouponRequest): Promise<CouponDto> {
        const url = buildApiUrl(COUPON_ENDPOINTS.COUPONS)
        return await apiService.post<CouponDto>(url, payload)
    }

    /**
     * Update an existing coupon.
     * PUT /api/v1/coupons/:id
     * Returns the updated CouponDto.
     */
    async updateCoupon(payload: UpdateCouponRequest): Promise<CouponDto> {
        const url = buildApiUrl(`${COUPON_ENDPOINTS.COUPONS}/${payload.id}`)
        return await apiService.put<CouponDto>(url, payload)
    }

    /**
     * Fetch a paginated list of coupons.
     * GET /api/v1/coupons
     */
    async getCoupons(params: GetCouponListQuery): Promise<GetCouponListResponse> {
        const url = buildApiUrl(COUPON_ENDPOINTS.COUPONS)
        return await apiService.get<GetCouponListResponse>(url, { params })
    }

    /**
     * Fetch a single coupon by its ID.
     * GET /api/v1/coupons/:id
     */
    async getCouponById(id: string): Promise<CouponDto> {
        const url = buildApiUrl(`${COUPON_ENDPOINTS.COUPONS}/${id}`)
        return await apiService.get<CouponDto>(url)
    }

    /**
     * Delete a single coupon by its ID.
     * DELETE /api/v1/coupons/:id
     */
    async deleteCoupon(id: string): Promise<void> {
        const url = buildApiUrl(`${COUPON_ENDPOINTS.COUPONS}/${id}`)
        return await apiService.delete(url)
    }

    /**
     * End a single coupon by its ID.
     * POST /api/v1/coupons/:id/end
     */
    async endCoupon(id: string): Promise<CouponDto> {
        const url = buildApiUrl(`${COUPON_ENDPOINTS.COUPONS}/${id}/end`)
        return await apiService.post<CouponDto>(url)
    }
}

export const couponService = new CouponService()

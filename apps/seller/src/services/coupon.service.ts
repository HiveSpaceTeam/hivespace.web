import type {
  CreateCouponRequest,
  UpdateCouponRequest,
  CouponDto,
  GetCouponListQuery,
  GetCouponListResponse,
} from '@/types'
import { BaseService } from './base.service'

class CouponService extends BaseService {
  async createCoupon(payload: CreateCouponRequest): Promise<CouponDto> {
    return this.post<CouponDto>('/coupons', payload)
  }

  async updateCoupon(payload: UpdateCouponRequest): Promise<CouponDto> {
    return this.put<CouponDto>(`/coupons/${payload.id}`, payload)
  }

  async getCoupons(params: GetCouponListQuery): Promise<GetCouponListResponse> {
    return this.get<GetCouponListResponse>('/coupons', { params })
  }

  async getCouponById(id: string): Promise<CouponDto> {
    return this.get<CouponDto>(`/coupons/${id}`)
  }

  async deleteCoupon(id: string): Promise<void> {
    return this.delete<void>(`/coupons/${id}`)
  }

  async endCoupon(id: string): Promise<CouponDto> {
    return this.post<CouponDto>(`/coupons/${id}/end`)
  }
}

export const couponService = new CouponService()

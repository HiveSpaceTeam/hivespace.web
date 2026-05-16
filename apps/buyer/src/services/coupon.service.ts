import { BaseService } from './base.service'
import type { GetAvailableCouponsResponse } from '@/types'

class CouponService extends BaseService {
  getAvailableCoupons(
    storeId: string,
    productIds: number[],
  ): Promise<GetAvailableCouponsResponse> {
    const query = new URLSearchParams({
      storeId,
      productIds: [...new Set(productIds.filter(productId => Number.isFinite(productId)))].join(','),
    })

    return this.get<GetAvailableCouponsResponse>(`/coupons/available?${query.toString()}`)
  }
}

export const couponService = new CouponService()

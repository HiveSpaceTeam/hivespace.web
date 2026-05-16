import { BaseService } from './base.service'
import type {
  GetCartSummaryRequest,
  GetCartSummaryResponse,
  AddCartItemRequest,
  AddCartItemResponse,
  UpdateCartItemsRequest,
  GetSelectedItemsCountResponse,
} from '@/types'

class CartService extends BaseService {
  getCartSummary(data: GetCartSummaryRequest): Promise<GetCartSummaryResponse> {
    return this.post<GetCartSummaryResponse>('/carts/summary', data)
  }

  applyPlatformCoupon(couponCode: string) {
    return this.post('/carts/coupons/platform', { couponCode })
  }

  removePlatformCoupon(couponCode: string) {
    return this.delete(`/carts/coupons/platform/${encodeURIComponent(couponCode)}`)
  }

  applyStoreCoupon(storeId: string, couponCode: string) {
    return this.put(`/carts/coupons/stores/${storeId}`, { couponCode })
  }

  removeStoreCoupon(storeId: string) {
    return this.delete(`/carts/coupons/stores/${storeId}`)
  }

  addCartItem(data: AddCartItemRequest): Promise<AddCartItemResponse> {
    return this.post<AddCartItemResponse>('/carts/items', data)
  }

  removeCartItem(cartItemId: string): Promise<void> {
    return this.delete<void>(`/carts/items/${cartItemId}`)
  }

  updateCartItems(data: UpdateCartItemsRequest): Promise<void> {
    return this.put<void>('/carts/items', data)
  }

  getSelectedItemsCount(): Promise<GetSelectedItemsCountResponse> {
    return this.get<GetSelectedItemsCountResponse>('/carts/items/selected/count')
  }
}

export const cartService = new CartService()

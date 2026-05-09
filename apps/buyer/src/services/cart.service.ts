import { BaseService } from './base.service'
import type {
  GetCartItemsResponse,
  AddCartItemRequest,
  AddCartItemResponse,
  UpdateCartItemsRequest,
  GetSelectedItemsCountResponse,
} from '@/types'

class CartService extends BaseService {
  getCartItems(): Promise<GetCartItemsResponse> {
    return this.get<GetCartItemsResponse>('/carts/items')
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

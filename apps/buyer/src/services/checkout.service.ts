import { BaseService } from './base.service'
import type { CheckoutPreview, CheckoutPreviewRequest, CheckoutRequest, CheckoutResult } from '@/types'

class CheckoutService extends BaseService {
  getPreview(request: CheckoutPreviewRequest = {}): Promise<CheckoutPreview> {
    return this.post<CheckoutPreview>('/orders/checkout/preview', request)
  }

  initiateCheckout(request: CheckoutRequest): Promise<CheckoutResult> {
    return this.post<CheckoutResult>('/orders/checkout', request)
  }
}

export const checkoutService = new CheckoutService()

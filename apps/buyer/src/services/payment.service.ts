import { BaseService } from './base.service'
import type { PaymentDto } from '@/types'

class PaymentService extends BaseService {
  getPayment(paymentId: string): Promise<PaymentDto> {
    return this.get<PaymentDto>(`/payments/${paymentId}`)
  }

  getPaymentByOrder(orderId: string): Promise<PaymentDto> {
    return this.get<PaymentDto>(`/payments/by-order/${orderId}`)
  }
}

export const paymentService = new PaymentService()

export type PaymentStatus = 'Pending' | 'Processing' | 'Succeeded' | 'Failed' | 'Cancelled' | 'Expired'

export interface PaymentDto {
  paymentId: string
  orderId: string
  buyerId: string
  amount: number
  currency: string
  status: PaymentStatus
  gateway: string
  gatewayTransactionId: string | null
  gatewayPaymentUrl: string | null
  paidAt: string | null
  expiresAt: string
  createdAt: string
}

export function isTerminalStatus(status: PaymentStatus): boolean {
  return ['Succeeded', 'Failed', 'Cancelled', 'Expired'].includes(status)
}

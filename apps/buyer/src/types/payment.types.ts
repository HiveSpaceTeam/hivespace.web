import type { MoneyIssue, SupportedCurrencyCode } from '@hivespace/shared'

export type PaymentStatus = 'Pending' | 'Processing' | 'Succeeded' | 'Failed' | 'Cancelled' | 'Expired'

export interface PaymentDto {
  paymentId: string
  orderId: string
  buyerId: string
  amount: number
  currency: string | null
  currencyCode?: SupportedCurrencyCode | null
  moneyIssue?: MoneyIssue | null
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

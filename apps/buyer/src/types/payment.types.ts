import type {
  MoneyIssue,
  PaymentAttempt,
  PaymentDetail,
  PaymentMethodCode,
  PaymentMethodMetadata,
  PaymentStatus,
  SupportedCurrencyCode,
} from '@hivespace/shared'
import { isTerminalPaymentStatus } from '@hivespace/shared'

export type {
  CreatePaymentAttemptRequest,
  CreatePaymentAttemptResponse,
  GetPaymentMethodsResponse,
  PaymentAttempt,
  PaymentDetail,
  PaymentMethodCode,
  PaymentMethodMetadata,
  PaymentStatus,
} from '@hivespace/shared'

export interface PaymentDto {
  id: string
  paymentId?: string
  referenceNo?: string | null
  orderId?: string | null
  buyerId?: string | null
  amount: number
  currency: string | null
  currencyCode?: SupportedCurrencyCode | null
  moneyIssue?: MoneyIssue | null
  status: PaymentStatus
  methodCode?: PaymentMethodCode | null
  method?: Partial<PaymentMethodMetadata> | null
  gateway?: string | null
  gatewayTransactionId?: string | null
  gatewayPaymentUrl: string | null
  latestAttempt?: PaymentAttempt | null
  attempts?: PaymentAttempt[]
  linkedOrders?: PaymentDetail['linkedOrders']
  paidAt: string | null
  expiresAt?: string | null
  createdAt?: string | null
}

export function isTerminalStatus(status: PaymentStatus): boolean {
  return isTerminalPaymentStatus(status)
}

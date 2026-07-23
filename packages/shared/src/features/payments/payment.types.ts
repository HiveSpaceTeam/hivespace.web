import type { CurrencyCodeInput, MoneyDisplay } from '../../types/money.types'

export type PaymentMethodCode = 'COD' | 'VNPAY' | 'STRIPE' | string

export type PaymentMethodKind = 'Offline' | 'Online' | string

export type PaymentMethodAvailability = 'Available' | 'Unavailable' | 'Future' | string

export type PaymentStatus = 'Pending' | 'Processing' | 'Succeeded' | 'Failed' | 'Cancelled' | 'Expired'

export interface PaymentMethodMetadata {
  code: PaymentMethodCode
  displayName: string
  kind: PaymentMethodKind
  gatewayCode: string | null
  isEnabled: boolean
  isCheckoutSelectable: boolean
  availability: PaymentMethodAvailability
  sortOrder: number
}

export interface GetPaymentMethodsResponse {
  methods: PaymentMethodMetadata[]
}

export interface PaymentAttempt {
  id: string
  attemptNo: number
  methodCode: PaymentMethodCode
  gatewayCode?: string | null
  status: PaymentStatus
  redirectUrl?: string | null
  gatewayTransactionId?: string | null
  failureReasonCode?: string | null
  createdAt: string
  expiresAt?: string | null
  completedAt?: string | null
}

export interface PaymentLinkedOrder {
  orderId: string
  orderCode?: string | null
  storeId?: string | null
  amount?: MoneyDisplay | number | null
  currency?: CurrencyCodeInput
  currencyCode?: CurrencyCodeInput
}

export interface OrderPaymentSummary {
  paymentId?: string | null
  paymentReferenceNo?: string | null
  paymentMethodCode?: PaymentMethodCode | null
  paymentStatus?: PaymentStatus | null
  paymentAttemptId?: string | null
  paymentAttemptNo?: number | null
}

export interface PaymentGatewaySummary {
  code?: string | null
  merchantReference?: string | null
  gatewayTransactionId?: string | null
}

export interface PaymentDetail {
  id: string
  paymentId?: string
  referenceNo?: string | null
  orderId?: string | null
  buyerId?: string | null
  method?: Partial<PaymentMethodMetadata> | null
  methodCode?: PaymentMethodCode | null
  status: PaymentStatus
  amount: MoneyDisplay | number
  currency?: CurrencyCodeInput
  currencyCode?: CurrencyCodeInput
  moneyIssue?: MoneyDisplay['issue']
  gateway?: PaymentGatewaySummary | string | null
  gatewayTransactionId?: string | null
  gatewayPaymentUrl?: string | null
  latestAttempt?: PaymentAttempt | null
  attempts?: PaymentAttempt[]
  linkedOrders?: PaymentLinkedOrder[]
  paidAt?: string | null
  expiresAt?: string | null
  createdAt?: string | null
}

export interface CreatePaymentAttemptRequest {
  methodCode: PaymentMethodCode
  idempotencyKey: string
}

export interface CreatePaymentAttemptResponse {
  paymentId: string
  referenceNo: string
  attempt: PaymentAttempt
}

export interface IPaymentService {
  getPaymentMethods(): Promise<GetPaymentMethodsResponse>
  getPaymentDetail(paymentId: string): Promise<PaymentDetail>
  getPaymentByReference(referenceNo: string): Promise<PaymentDetail>
  getPaymentByOrder(orderId: string): Promise<PaymentDetail>
  createPaymentAttempt(
    paymentId: string,
    request: CreatePaymentAttemptRequest,
  ): Promise<CreatePaymentAttemptResponse>
}

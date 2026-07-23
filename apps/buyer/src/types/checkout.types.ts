import type {
  CurrencyCodeInput,
  MoneyIssue,
  PaymentAttempt,
  PaymentMethodCode,
  SupportedCurrencyCode,
} from '@hivespace/shared'
import type { AppliedPlatformCoupon, AppliedStoreCoupon, InvalidAppliedCoupon } from './cart.types'

export interface CheckoutItem {
  cartItemId: string
  productId: number
  skuId: number
  productName: string
  imageUrl: string
  skuAttributes?: string
  originalPrice?: number
  price: number
  currency: CurrencyCodeInput
  currencyCode: SupportedCurrencyCode | null
  moneyIssue?: MoneyIssue | null
  quantity: number
  lineTotal: number
}

export interface DeliveryPackage {
  storeId: string
  storeName?: string
  shippingType: 'economy' | 'fast'
  originalShippingFee?: number
  shippingFee: number
  currency: CurrencyCodeInput
  currencyCode: SupportedCurrencyCode | null
  moneyIssue?: MoneyIssue | null
  originalSubtotal: number
  subtotal: number
  packageTotal: number
  appliedStoreCoupon?: AppliedStoreCoupon | null
  items: CheckoutItem[]
}

export interface CheckoutPreview {
  packages: DeliveryPackage[]
  originalSubtotal: number
  subtotal: number
  currency: CurrencyCodeInput
  currencyCode: SupportedCurrencyCode | null
  moneyIssue?: MoneyIssue | null
  totalShippingFee: number
  grandTotal: number
  totalItems: number
  platformCoupons: AppliedPlatformCoupon[]
  invalidatedCoupons: InvalidAppliedCoupon[]
}

export type CheckoutPreviewRequest = Record<string, never>

export interface DeliveryAddressDto {
  recipientName: string
  phone: string
  streetAddress: string
  commune: string
  province: string
  country?: string
  notes?: string
}

export const PaymentMethod = {
  COD: 'COD',
  VNPAY: 'VNPAY',
} as const

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export interface CheckoutRequest {
  deliveryAddress: DeliveryAddressDto
  paymentMethodCode?: PaymentMethodCode
}

export interface CheckoutResult {
  orderIds: string[]
  status: string
  grandTotal: number
  paymentId?: string | null
  paymentReferenceNo?: string | null
  referenceNo?: string | null
  latestAttempt?: PaymentAttempt | null
  paymentUrl?: string | null
  paymentExpiresAt?: string | null
}

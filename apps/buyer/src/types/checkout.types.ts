export interface CheckoutItem {
  cartItemId: string
  productId: number
  skuId: number
  productName: string
  imageUrl: string
  skuAttributes?: string
  originalPrice?: number
  price: number
  currency: string
  quantity: number
  lineTotal: number
}

export interface DeliveryPackage {
  storeId: string
  storeName?: string
  shippingType: 'economy' | 'fast'
  originalShippingFee?: number
  shippingFee: number
  currency: string
  originalSubtotal: number
  subtotal: number
  packageTotal: number
  items: CheckoutItem[]
}

export interface CheckoutPreview {
  packages: DeliveryPackage[]
  originalSubtotal: number
  subtotal: number
  currency: string
  totalShippingFee: number
  grandTotal: number
  totalItems: number
}

export interface StoreCouponEntry {
  storeId: string
  couponCode: string
}

export interface CheckoutPreviewRequest {
  storeCoupons?: StoreCouponEntry[]
  platformCouponCodes?: string[]
}

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
  COD: 1,
  VNPAY: 2,
  MOMO: 3,
  BankTransfer: 4,
  Balance: 5,
  PayPal: 6
} as const

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]


export interface CheckoutRequest {
  deliveryAddress: DeliveryAddressDto
  couponCodes?: string[]
  paymentMethod?: PaymentMethod
}

export interface CheckoutResult {
  orderId: string
  status: string
  grandTotal: number
  paymentUrl?: string | null
  paymentExpiresAt?: string | null
}

import type { AppliedPlatformCoupon, InvalidAppliedCoupon } from '@/types'

type StoreCoupon = { storeId: string; couponCode: string } | null | undefined

export const isStoreCouponEqual = (left: StoreCoupon, right: StoreCoupon) => {
  if (!left && !right) return true
  if (!left || !right) return false
  return left.storeId === right.storeId && left.couponCode === right.couponCode
}

export const arePlatformCouponsEqual = (
  left: AppliedPlatformCoupon[],
  right: AppliedPlatformCoupon[],
) =>
  left.length === right.length &&
  left.every((coupon, index) => coupon.couponCode === right[index]?.couponCode)

export const areInvalidCouponsEqual = (
  left: InvalidAppliedCoupon[],
  right: InvalidAppliedCoupon[],
) =>
  left.length === right.length &&
  left.every((coupon, index) => {
    const nextCoupon = right[index]
    return (
      coupon.couponCode === nextCoupon?.couponCode &&
      coupon.ownerType === nextCoupon.ownerType &&
      coupon.storeId === nextCoupon.storeId &&
      coupon.reasonCode === nextCoupon.reasonCode &&
      coupon.message === nextCoupon.message
    )
  })

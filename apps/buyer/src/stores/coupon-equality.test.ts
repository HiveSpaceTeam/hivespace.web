import { describe, expect, it } from '@jest/globals'
import { arePlatformCouponsEqual, areInvalidCouponsEqual, isStoreCouponEqual } from './coupon-equality'

describe('isStoreCouponEqual', () => {
  it('isStoreCouponEqual_BothNull_ReturnsTrue', () => {
    expect(isStoreCouponEqual(null, null)).toBe(true)
  })

  it('isStoreCouponEqual_BothUndefined_ReturnsTrue', () => {
    expect(isStoreCouponEqual(undefined, undefined)).toBe(true)
  })

  it('isStoreCouponEqual_LeftNullRightDefined_ReturnsFalse', () => {
    expect(isStoreCouponEqual(null, { storeId: 'store-001', couponCode: 'SAVE10' })).toBe(false)
  })

  it('isStoreCouponEqual_LeftDefinedRightNull_ReturnsFalse', () => {
    expect(isStoreCouponEqual({ storeId: 'store-001', couponCode: 'SAVE10' }, null)).toBe(false)
  })

  it('isStoreCouponEqual_DifferentStoreId_ReturnsFalse', () => {
    expect(
      isStoreCouponEqual(
        { storeId: 'store-001', couponCode: 'SAVE10' },
        { storeId: 'store-002', couponCode: 'SAVE10' },
      ),
    ).toBe(false)
  })

  it('isStoreCouponEqual_DifferentCouponCode_ReturnsFalse', () => {
    expect(
      isStoreCouponEqual(
        { storeId: 'store-001', couponCode: 'SAVE10' },
        { storeId: 'store-001', couponCode: 'SAVE20' },
      ),
    ).toBe(false)
  })

  it('isStoreCouponEqual_BothEqual_ReturnsTrue', () => {
    expect(
      isStoreCouponEqual(
        { storeId: 'store-001', couponCode: 'SAVE10' },
        { storeId: 'store-001', couponCode: 'SAVE10' },
      ),
    ).toBe(true)
  })
})

describe('arePlatformCouponsEqual', () => {
  it('arePlatformCouponsEqual_EmptyArrays_ReturnsTrue', () => {
    expect(arePlatformCouponsEqual([], [])).toBe(true)
  })

  it('arePlatformCouponsEqual_DifferentLengths_ReturnsFalse', () => {
    expect(arePlatformCouponsEqual([{ couponCode: 'SAVE10' }], [])).toBe(false)
  })

  it('arePlatformCouponsEqual_DifferentCodes_ReturnsFalse', () => {
    expect(
      arePlatformCouponsEqual([{ couponCode: 'SAVE10' }], [{ couponCode: 'SAVE20' }]),
    ).toBe(false)
  })

  it('arePlatformCouponsEqual_SameCodes_ReturnsTrue', () => {
    expect(
      arePlatformCouponsEqual([{ couponCode: 'SAVE10' }], [{ couponCode: 'SAVE10' }]),
    ).toBe(true)
  })

  it('arePlatformCouponsEqual_MultipleCouponsAllMatch_ReturnsTrue', () => {
    expect(
      arePlatformCouponsEqual(
        [{ couponCode: 'A' }, { couponCode: 'B' }],
        [{ couponCode: 'A' }, { couponCode: 'B' }],
      ),
    ).toBe(true)
  })
})

describe('areInvalidCouponsEqual', () => {
  const baseCoupon = {
    couponCode: 'EXPIRED',
    ownerType: 'Platform' as const,
    reasonCode: 'expired',
    message: 'Coupon expired',
  }

  it('areInvalidCouponsEqual_EmptyArrays_ReturnsTrue', () => {
    expect(areInvalidCouponsEqual([], [])).toBe(true)
  })

  it('areInvalidCouponsEqual_DifferentLengths_ReturnsFalse', () => {
    expect(areInvalidCouponsEqual([baseCoupon], [])).toBe(false)
  })

  it('areInvalidCouponsEqual_DifferentCouponCode_ReturnsFalse', () => {
    expect(
      areInvalidCouponsEqual([baseCoupon], [{ ...baseCoupon, couponCode: 'OTHER' }]),
    ).toBe(false)
  })

  it('areInvalidCouponsEqual_DifferentOwnerType_ReturnsFalse', () => {
    expect(
      areInvalidCouponsEqual([baseCoupon], [{ ...baseCoupon, ownerType: 'Store' }]),
    ).toBe(false)
  })

  it('areInvalidCouponsEqual_DifferentReasonCode_ReturnsFalse', () => {
    expect(
      areInvalidCouponsEqual([baseCoupon], [{ ...baseCoupon, reasonCode: 'minOrder' }]),
    ).toBe(false)
  })

  it('areInvalidCouponsEqual_DifferentMessage_ReturnsFalse', () => {
    expect(
      areInvalidCouponsEqual([baseCoupon], [{ ...baseCoupon, message: 'Different message' }]),
    ).toBe(false)
  })

  it('areInvalidCouponsEqual_AllFieldsMatch_ReturnsTrue', () => {
    expect(areInvalidCouponsEqual([baseCoupon], [{ ...baseCoupon }])).toBe(true)
  })
})

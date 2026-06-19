import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { useCouponStore } from './coupon.store'
import { couponService } from '@/services/coupon.service'
import type { AvailableCouponStore } from '@/types'

jest.mock('@/services/coupon.service', () => ({
  couponService: {
    getAvailableCoupons: jest.fn(),
  },
}))

const fakeAvailableCouponStore = (): AvailableCouponStore => ({
  storeId: 'store-001',
  storeName: 'Hive Store',
  storeLogoUrl: null,
  coupons: [
    {
      id: 'coupon-001',
      code: 'SAVE10',
      name: 'Save 10%',
      discountAmount: 10,
      discountPercentage: 0,
      minOrderAmount: 100_000,
      maxDiscountAmount: 50_000,
    },
  ],
})

describe('useCouponStore (buyer)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(couponService.getAvailableCoupons).mockResolvedValue(fakeAvailableCouponStore())
  })

  it('should load coupons from the API', async () => {
    const store = useCouponStore()

    await store.fetchAvailableCoupons('store-001', [10, 20])

    expect(couponService.getAvailableCoupons).toHaveBeenCalledWith('store-001', [10, 20])
  })

  it('should call apply endpoint and track loaded state', async () => {
    const store = useCouponStore()

    await store.fetchAvailableCoupons('store-001', [10])

    const key = store.buildCouponRequestKey('store-001', [10])
    expect(store.availableCouponStoresByKey[key]).toBeDefined()
    expect(store.loadedByKey[key]).toBe(true)
  })

  it('should return without fetching when store ID is empty', async () => {
    const store = useCouponStore()

    await store.fetchAvailableCoupons('', [10])

    expect(couponService.getAvailableCoupons).not.toHaveBeenCalled()
  })

  it('should skip service call when coupons are already loaded', async () => {
    const store = useCouponStore()
    await store.fetchAvailableCoupons('store-001', [10])
    jest.mocked(couponService.getAvailableCoupons).mockClear()

    await store.fetchAvailableCoupons('store-001', [10])

    expect(couponService.getAvailableCoupons).not.toHaveBeenCalled()
  })
})

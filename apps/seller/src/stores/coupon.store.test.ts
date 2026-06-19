import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { DiscountType, CouponScope } from '@hivespace/shared'
import { useCouponStore } from './coupon.store'
import { couponService } from '@/services/coupon.service'
import { CouponStatus } from '@/types'
import type { CouponSummaryDto } from '@/types'

jest.mock('@/services/coupon.service', () => ({
  couponService: {
    createCoupon: jest.fn(),
    updateCoupon: jest.fn(),
    getCoupons: jest.fn(),
    getCouponById: jest.fn(),
    deleteCoupon: jest.fn(),
    endCoupon: jest.fn(),
  },
}))

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifySuccess: jest.fn(),
      notifyError: jest.fn(),
    }),
  }
})

const fakeCouponSummary = (overrides: Partial<CouponSummaryDto> = {}): CouponSummaryDto => ({
  id: 'coupon-001',
  name: 'Summer Sale',
  code: 'SUMMER10',
  discountType: DiscountType.FixedAmount,
  discountAmount: 10,
  discountCurrency: 'VND',
  minOrderAmount: 0,
  maxUsageCount: 100,
  currentUsageCount: 0,
  isHidden: false,
  isActive: true,
  status: CouponStatus.Ongoing,
  startDateTime: '2026-06-01T00:00:00Z',
  endDateTime: '2026-12-31T00:00:00Z',
  applicableProductIds: [],
  ...overrides,
})

describe('useCouponStore (seller)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(couponService.getCoupons).mockResolvedValue({
      coupons: [fakeCouponSummary()],
      pagination: {
        currentPage: 1,
        pageSize: 20,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    })
    jest.mocked(couponService.createCoupon).mockResolvedValue({
      id: 'coupon-002',
      name: 'New Coupon',
      code: 'NEW10',
      discountType: DiscountType.FixedAmount,
      discountAmount: 10,
      minOrderAmount: 50_000,
      maxUsageCount: 100,
      currentUsageCount: 0,
      maxUsagePerUser: 1,
      isHidden: false,
      isActive: false,
      ownerType: 1,
      createdBy: 'seller-001',
      status: CouponStatus.Upcoming,
      scope: CouponScope.ItemPrice,
      startDateTime: '2026-06-01T00:00:00Z',
      endDateTime: '2026-12-31T00:00:00Z',
      createdAt: '2026-06-01T00:00:00Z',
      applicableProductIds: [],
      applicableCategoryIds: [],
    })
    jest.mocked(couponService.endCoupon).mockResolvedValue({
      id: 'coupon-001',
      code: 'SUMMER10',
      name: 'Summer Sale',
      discountType: DiscountType.FixedAmount,
      discountAmount: 10,
      minOrderAmount: 0,
      maxUsageCount: 100,
      currentUsageCount: 0,
      maxUsagePerUser: 1,
      isHidden: false,
      isActive: false,
      ownerType: 1,
      createdBy: 'seller-001',
      status: CouponStatus.Expired,
      scope: CouponScope.ItemPrice,
      startDateTime: '2026-06-01T00:00:00Z',
      endDateTime: '2026-12-31T00:00:00Z',
      createdAt: '2026-06-01T00:00:00Z',
      applicableProductIds: [],
      applicableCategoryIds: [],
    })
  })

  it('should load coupons from the API', async () => {
    const store = useCouponStore()

    await store.fetchCoupons({ page: 1, pageSize: 20, couponStatus: CouponStatus.All })

    expect(couponService.getCoupons).toHaveBeenCalled()
    expect(store.coupons).toHaveLength(1)
    expect(store.coupons[0]?.code).toBe('SUMMER10')
  })

  it('should append new coupon to list', async () => {
    const store = useCouponStore()

    const result = await store.createCoupon({
      code: 'NEW10',
      name: 'New Coupon',
      startDateTime: '2026-06-01T00:00:00Z',
      endDateTime: '2026-12-31T00:00:00Z',
      discountType: DiscountType.FixedAmount,
      discountAmount: 10,
      discountCurrency: 'VND',
      minOrderAmount: 50_000,
      scope: CouponScope.ItemPrice,
      maxUsageCount: 100,
      maxUsagePerUser: 1,
      isHidden: false,
      applicableProductIds: [],
      applicableCategoryIds: [],
    })

    expect(couponService.createCoupon).toHaveBeenCalled()
    expect(result.code).toBe('NEW10')
  })

  it('should update coupon status when ended', async () => {
    const store = useCouponStore()

    await store.endCoupon('coupon-001')

    expect(couponService.endCoupon).toHaveBeenCalledWith('coupon-001')
  })

  it('should update current coupon', async () => {
    const updatedDto = {
      id: 'coupon-001',
      name: 'Updated Summer Sale',
      code: 'SHOP1234',
      discountType: DiscountType.FixedAmount,
      discountAmount: 20,
      minOrderAmount: 100_000,
      maxUsageCount: 200,
      currentUsageCount: 0,
      maxUsagePerUser: 2,
      isHidden: false,
      isActive: true,
      ownerType: 1,
      createdBy: 'seller-001',
      status: CouponStatus.Ongoing,
      scope: CouponScope.ItemPrice,
      startDateTime: '2026-06-01T00:00:00Z',
      endDateTime: '2026-12-31T00:00:00Z',
      createdAt: '2026-06-01T00:00:00Z',
      applicableProductIds: [],
      applicableCategoryIds: [],
    }
    jest.mocked(couponService.updateCoupon).mockResolvedValue(updatedDto)

    const store = useCouponStore()
    const result = await store.updateCoupon({
      id: 'coupon-001',
      code: 'SHOP1234',
      name: 'Updated Summer Sale',
      startDateTime: '2026-06-01T00:00:00Z',
      endDateTime: '2026-12-31T00:00:00Z',
      discountAmount: 20,
      discountCurrency: 'VND',
      discountPercentage: null,
      maxDiscountAmount: null,
      minOrderAmount: 100_000,
      maxUsageCount: 200,
      applicableProductIds: [],
      earlySaveDateTime: null,
    })

    expect(couponService.updateCoupon).toHaveBeenCalled()
    expect(result.name).toBe('Updated Summer Sale')
    expect(store.currentCoupon?.name).toBe('Updated Summer Sale')
  })

  it('should call delete endpoint and notify', async () => {
    jest.mocked(couponService.deleteCoupon).mockResolvedValue(undefined)

    const store = useCouponStore()

    await store.deleteCoupon('coupon-001')

    expect(couponService.deleteCoupon).toHaveBeenCalledWith('coupon-001')
  })

  it('should cache current coupon when fetched by id', async () => {
    const dto = {
      id: 'coupon-001',
      name: 'Summer Sale',
      code: 'SHOPSUM1',
      discountType: DiscountType.FixedAmount,
      discountAmount: 10,
      minOrderAmount: 50_000,
      maxUsageCount: 100,
      currentUsageCount: 5,
      maxUsagePerUser: 1,
      isHidden: false,
      isActive: true,
      ownerType: 1,
      createdBy: 'seller-001',
      status: CouponStatus.Ongoing,
      scope: CouponScope.ItemPrice,
      startDateTime: '2026-06-01T00:00:00Z',
      endDateTime: '2026-12-31T00:00:00Z',
      createdAt: '2026-06-01T00:00:00Z',
      applicableProductIds: [],
      applicableCategoryIds: [],
    }
    jest.mocked(couponService.getCouponById).mockResolvedValue(dto)

    const store = useCouponStore()
    const result = await store.fetchCouponById('coupon-001')

    expect(couponService.getCouponById).toHaveBeenCalledWith('coupon-001')
    expect(result.id).toBe('coupon-001')
    expect(store.currentCoupon?.id).toBe('coupon-001')
  })

  it('should reset coupons list when cleared', async () => {
    const store = useCouponStore()
    await store.fetchCoupons({ page: 1, pageSize: 20, couponStatus: CouponStatus.All })
    expect(store.coupons).toHaveLength(1)

    store.clearCoupons()

    expect(store.coupons).toHaveLength(0)
  })

  it('should clear transient state on reset', async () => {
    const store = useCouponStore()
    await store.createCoupon({
      code: 'NEW10',
      name: 'New Coupon',
      startDateTime: '2026-06-01T00:00:00Z',
      endDateTime: '2026-12-31T00:00:00Z',
      discountType: DiscountType.FixedAmount,
      discountAmount: 10,
      discountCurrency: 'VND',
      minOrderAmount: 50_000,
      scope: CouponScope.ItemPrice,
      maxUsageCount: 100,
      maxUsagePerUser: 1,
      isHidden: false,
      applicableProductIds: [],
      applicableCategoryIds: [],
    })
    expect(store.createdCoupon).not.toBeNull()

    store.reset()

    expect(store.createdCoupon).toBeNull()
    expect(store.currentCoupon).toBeNull()
  })
})

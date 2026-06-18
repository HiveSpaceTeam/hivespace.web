import { describe, expect, it } from '@jest/globals'
import { ref } from 'vue'
import { useCouponValidation, type CouponFormData, type CouponFormErrors } from './useCouponValidation'
import { CouponType, DiscountType, RewardType } from '@/types'

const now = Date.now()

const makeForm = (overrides: Partial<CouponFormData> = {}): CouponFormData => ({
  type: CouponType.ENTIRE_SHOP,
  name: 'Summer Sale',
  prefix: 'SUM',
  code: 'SUM10',
  startDate: new Date(now + 86_400_000).toISOString(),
  endDate: new Date(now + 7 * 86_400_000).toISOString(),
  allowEarlySave: false,
  earlySaveDate: '',
  rewardType: RewardType.Discount,
  discountType: DiscountType.Percentage,
  discountAmount: '10',
  hasMaxDiscount: false,
  maxDiscountAmount: '',
  minOrderValue: '100',
  totalUsages: '100',
  maxUsagesPerBuyer: '1',
  displaySettings: false,
  currency: 'VND',
  applicableProductsType: CouponType.ENTIRE_SHOP,
  initialEarlySavePassed: false,
  ...overrides,
})

const makeErrors = (): CouponFormErrors => ({
  common: [],
  name: '',
  code: '',
  startDateTime: '',
  endDateTime: '',
  discountAmount: '',
  maxDiscountAmount: '',
  minOrderAmount: '',
  maxUsageCount: '',
  maxUsagePerUser: '',
  earlySaveDateTime: '',
})

const t = (key: string, values?: Record<string, string | number | boolean>) => {
  if (!values) return key
  return `${key}:${JSON.stringify(values)}`
}

const createValidation = (
  overrides: Partial<CouponFormData> = {},
  options?: { isEditMode?: boolean; initialStartDate?: string },
) => {
  const form = ref(makeForm(overrides))
  const errors = makeErrors()
  const isEditMode = ref(Boolean(options?.isEditMode))
  const initialStartDate = ref(options?.initialStartDate ?? '')
  const validation = useCouponValidation(form, errors, t, isEditMode, initialStartDate)

  return { form, errors, ...validation }
}

describe('useCouponValidation', () => {
  it('passes validation for a valid coupon', () => {
    const { errors, validateAllFields } = createValidation()

    expect(validateAllFields()).toBe(true)
    expect(errors.name).toBe('')
    expect(errors.code).toBe('')
  })

  it('fails validation for expired coupons', () => {
    const { validateAllFields } = createValidation({ endDate: '2020-01-01T00:00:00Z' })

    expect(validateAllFields()).toBe(false)
  })

  it('populates name error for missing names', () => {
    const { errors, validateName } = createValidation({ name: '' })

    expect(validateName()).toBe(false)
    expect(errors.name).toBe('coupon.detail.validation.nameRequired')
  })

  it('rejects non-alphanumeric coupon codes', () => {
    const { errors, validateCode } = createValidation({ code: 'AB-1' })

    expect(validateCode()).toBe(false)
    expect(errors.code).toBe('coupon.detail.validation.codeAlphanumeric')
  })

  it('rejects coupon codes longer than 5 characters', () => {
    const { errors, validateCode } = createValidation({ code: 'TOOLONG' })

    expect(validateCode()).toBe(false)
    expect(errors.code).toBe('coupon.detail.validation.codeTooLong')
  })

  it('allows unchanged past start dates in edit mode', () => {
    const startDate = '2020-01-01T00:00:00Z'
    const { errors, validateStartDateTime } = createValidation(
      { startDate },
      { isEditMode: true, initialStartDate: startDate },
    )

    expect(validateStartDateTime()).toBe(true)
    expect(errors.startDateTime).toBe('')
  })

  it('rejects changed past start dates in edit mode', () => {
    const { errors, validateStartDateTime } = createValidation(
      { startDate: '2020-01-01T00:00:00Z' },
      { isEditMode: true, initialStartDate: '2020-01-02T00:00:00Z' },
    )

    expect(validateStartDateTime()).toBe(false)
    expect(errors.startDateTime).toBe('coupon.detail.validation.startDateFuture')
  })

  it('requires an end date', () => {
    const { errors, validateEndDateTime } = createValidation({ endDate: '' })

    expect(validateEndDateTime()).toBe(false)
    expect(errors.endDateTime).toBe('coupon.detail.validation.endDateRequired')
  })

  it('requires the end date to be after the start date', () => {
    const startDate = new Date(now + 7 * 86_400_000).toISOString()
    const { errors, validateEndDateTime } = createValidation({ startDate, endDate: startDate })

    expect(validateEndDateTime()).toBe(false)
    expect(errors.endDateTime).toBe('coupon.detail.validation.endDateAfterStart')
  })

  it.each([
    ['when early save is disabled', { allowEarlySave: false, earlySaveDate: '2026-01-01T00:00:00Z' }],
    ['when early save date is blank', { allowEarlySave: true, earlySaveDate: '' }],
  ])('bypasses early-save validation %s', (_, overrides) => {
    const { errors, validateEarlySaveDateTime } = createValidation(overrides)

    expect(validateEarlySaveDateTime()).toBe(true)
    expect(errors.earlySaveDateTime).toBe('')
  })

  it('rejects early-save dates on or after the start date', () => {
    const startDate = new Date(now + 86_400_000).toISOString()
    const { errors, validateEarlySaveDateTime } = createValidation({
      allowEarlySave: true,
      startDate,
      earlySaveDate: startDate,
    })

    expect(validateEarlySaveDateTime()).toBe(false)
    expect(errors.earlySaveDateTime).toBe('coupon.detail.validation.earlySaveBeforeStart')
  })

  it('requires percentage discounts', () => {
    const { errors, validateDiscountAmount } = createValidation({
      discountType: DiscountType.Percentage,
      discountAmount: '',
    })

    expect(validateDiscountAmount()).toBe(false)
    expect(errors.discountAmount).toBe('coupon.detail.validation.discountPercentageRequired')
  })

  it('rejects percentage discounts greater than 100', () => {
    const { errors, validateDiscountAmount } = createValidation({
      discountType: DiscountType.Percentage,
      discountAmount: '101',
    })

    expect(validateDiscountAmount()).toBe(false)
    expect(errors.discountAmount).toBe('coupon.detail.validation.discountPercentageRange')
  })

  it.each([
    ['missing', ''],
    ['non-positive', '0'],
  ])('requires fixed discount amounts when %s', (_, discountAmount) => {
    const { errors, validateDiscountAmount } = createValidation({
      discountType: DiscountType.FixedAmount,
      discountAmount,
    })

    expect(validateDiscountAmount()).toBe(false)
    expect(errors.discountAmount).toBe('coupon.detail.validation.discountAmountRequired')
  })

  it('requires a max discount amount when enabled for percentage discounts', () => {
    const { errors, validateMaxDiscountAmount } = createValidation({
      discountType: DiscountType.Percentage,
      hasMaxDiscount: true,
      maxDiscountAmount: '',
    })

    expect(validateMaxDiscountAmount()).toBe(false)
    expect(errors.maxDiscountAmount).toBe('coupon.detail.validation.maxDiscountAmountRequired')
  })

  it('bypasses max discount validation when disabled', () => {
    const { errors, validateMaxDiscountAmount } = createValidation({
      discountType: DiscountType.Percentage,
      hasMaxDiscount: false,
      maxDiscountAmount: '',
    })

    expect(validateMaxDiscountAmount()).toBe(true)
    expect(errors.maxDiscountAmount).toBe('')
  })

  it.each([
    ['missing', ''],
    ['non-positive', '0'],
  ])('requires minimum order values when %s', (_, minOrderValue) => {
    const { errors, validateMinOrderAmount } = createValidation({ minOrderValue })

    expect(validateMinOrderAmount()).toBe(false)
    expect(errors.minOrderAmount).toBe('coupon.detail.validation.minOrderValueRequired')
  })

  it('returns the max-discount-too-small branch for incompatible values', () => {
    const { errors, validateMinOrderAmount } = createValidation({
      discountType: DiscountType.Percentage,
      discountAmount: '50',
      hasMaxDiscount: true,
      maxDiscountAmount: '10',
      minOrderValue: '100',
      currency: 'VND',
    })

    expect(validateMinOrderAmount()).toBe(false)
    expect(errors.minOrderAmount).toContain('coupon.detail.validation.maxDiscountAmountTooSmall')
  })

  it.each([
    ['missing', ''],
    ['non-positive', '0'],
  ])('requires total usages when %s', (_, totalUsages) => {
    const { errors, validateMaxUsageCount } = createValidation({ totalUsages })

    expect(validateMaxUsageCount()).toBe(false)
    expect(errors.maxUsageCount).toBe('coupon.detail.validation.totalUsagesRequired')
  })

  it.each([
    ['missing', ''],
    ['non-positive', '0'],
  ])('requires max usages per buyer when %s', (_, maxUsagesPerBuyer) => {
    const { errors, validateMaxUsagePerUser } = createValidation({ maxUsagesPerBuyer })

    expect(validateMaxUsagePerUser()).toBe(false)
    expect(errors.maxUsagePerUser).toBe('coupon.detail.validation.maxUsagesPerBuyerRequired')
  })
})

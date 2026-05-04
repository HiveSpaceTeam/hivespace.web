import type { Ref } from 'vue'
import { validatePositiveNumber, validateRequired } from '@hivespace/shared'
import { CouponType, DiscountType, RewardType } from '@/types'

export interface CouponFormData {
  type: CouponType
  name: string
  prefix: string
  code: string
  startDate: string
  endDate: string
  allowEarlySave: boolean
  earlySaveDate: string
  rewardType: RewardType
  discountType: DiscountType
  discountAmount: string
  hasMaxDiscount: boolean
  maxDiscountAmount: string
  minOrderValue: string
  totalUsages: string
  maxUsagesPerBuyer: string
  displaySettings: boolean
  currency: string
  applicableProductsType: CouponType
  initialEarlySavePassed: boolean
}

export interface CouponFormErrors {
  common: string[]
  name: string
  code: string
  startDateTime: string
  endDateTime: string
  discountAmount: string
  maxDiscountAmount: string
  minOrderAmount: string
  maxUsageCount: string
  maxUsagePerUser: string
  earlySaveDateTime: string
}

export function useCouponValidation(
  form: Ref<CouponFormData>,
  errors: CouponFormErrors,
  t: (key: string, values?: Record<string, string | number | boolean>) => string,
  isEditMode?: Ref<boolean>,
  initialStartDate?: Ref<string>,
) {
  const validateName = (): boolean => {
    const name = form.value.name.trim()
    const requiredError = validateRequired(name, t('coupon.detail.validation.nameRequired'))
    if (requiredError) {
      errors.name = requiredError
      return false
    }

    if (name.length > 100) {
      errors.name = t('coupon.detail.validation.nameTooLong')
      return false
    }

    errors.name = ''
    return true
  }

  const validateCode = (): boolean => {
    const code = form.value.code.trim()
    const requiredError = validateRequired(code, t('coupon.detail.validation.codeRequired'))
    if (requiredError) {
      errors.code = requiredError
      return false
    }

    if (!/^[A-Za-z0-9]+$/.test(code)) {
      errors.code = t('coupon.detail.validation.codeAlphanumeric')
      return false
    }

    if (code.length > 5) {
      errors.code = t('coupon.detail.validation.codeTooLong')
      return false
    }

    errors.code = ''
    return true
  }

  const validateStartDateTime = (): boolean => {
    const requiredError = validateRequired(
      form.value.startDate,
      t('coupon.detail.validation.startDateRequired'),
    )
    if (requiredError) {
      errors.startDateTime = requiredError
      return false
    }

    const dateUnchanged = isEditMode?.value && form.value.startDate === initialStartDate?.value
    if (!dateUnchanged) {
      const isFuture = new Date(form.value.startDate) > new Date()
      if (!isFuture) {
        errors.startDateTime = t('coupon.detail.validation.startDateFuture')
        return false
      }
    }

    errors.startDateTime = ''
    return true
  }

  const validateEndDateTime = (): boolean => {
    const requiredError = validateRequired(
      form.value.endDate,
      t('coupon.detail.validation.endDateRequired'),
    )
    if (requiredError) {
      errors.endDateTime = requiredError
      return false
    }

    if (new Date(form.value.endDate) <= new Date(form.value.startDate)) {
      errors.endDateTime = t('coupon.detail.validation.endDateAfterStart')
      return false
    }

    errors.endDateTime = ''
    return true
  }

  const validateEarlySaveDateTime = (): boolean => {
    if (!form.value.allowEarlySave || !form.value.earlySaveDate) {
      errors.earlySaveDateTime = ''
      return true
    }

    const earlyDate = new Date(form.value.earlySaveDate)
    const startDate = new Date(form.value.startDate)

    if (earlyDate >= startDate) {
      errors.earlySaveDateTime = t('coupon.detail.validation.earlySaveBeforeStart')
      return false
    }

    errors.earlySaveDateTime = ''
    return true
  }

  const validateDiscountAmount = (): boolean => {
    const value = Number(form.value.discountAmount)
    if (form.value.discountType === DiscountType.FixedAmount) {
      const requiredError = validateRequired(
        form.value.discountAmount,
        t('coupon.detail.validation.discountAmountRequired'),
      )
      if (requiredError || validatePositiveNumber(value, 'invalid')) {
        errors.discountAmount = t('coupon.detail.validation.discountAmountRequired')
        return false
      }
    } else {
      const requiredError = validateRequired(
        form.value.discountAmount,
        t('coupon.detail.validation.discountPercentageRequired'),
      )
      if (requiredError) {
        errors.discountAmount = requiredError
        return false
      }

      const positiveError = validatePositiveNumber(value, 'invalid')
      if (positiveError || value > 100) {
        errors.discountAmount = t('coupon.detail.validation.discountPercentageRange')
        return false
      }
    }

    errors.discountAmount = ''
    return true
  }

  const validateMaxDiscountAmount = (): boolean => {
    if (form.value.discountType === DiscountType.Percentage && form.value.hasMaxDiscount) {
      const value = Number(form.value.maxDiscountAmount)
      const requiredError = validateRequired(
        form.value.maxDiscountAmount,
        t('coupon.detail.validation.maxDiscountAmountRequired'),
      )
      if (requiredError || validatePositiveNumber(value, 'invalid')) {
        errors.maxDiscountAmount = t('coupon.detail.validation.maxDiscountAmountRequired')
        return false
      }
    }

    errors.maxDiscountAmount = ''
    return true
  }

  const validateMinOrderAmount = (): boolean => {
    const value = Number(form.value.minOrderValue)
    const requiredError = validateRequired(
      form.value.minOrderValue,
      t('coupon.detail.validation.minOrderValueRequired'),
    )
    if (requiredError || validatePositiveNumber(value, 'invalid')) {
      errors.minOrderAmount = t('coupon.detail.validation.minOrderValueRequired')
      return false
    }

    if (form.value.discountType === DiscountType.Percentage && form.value.hasMaxDiscount) {
      const maxDiscount = Number(form.value.maxDiscountAmount) || 0
      const percentage = Number(form.value.discountAmount) || 0

      if (maxDiscount > 0 && percentage > 0 && value > 0) {
        if (maxDiscount < (value * percentage) / 100) {
          const currencySymbol = form.value.currency || 'đ'
          const formatCurrency = (amt: number) => `${currencySymbol}${amt.toLocaleString('vi-VN')}`

          const suggestedMinOrder = formatCurrency(Math.floor((maxDiscount * 100) / percentage))
          const suggestedPercentage = Math.floor((maxDiscount / value) * 100)
          const suggestedMaxDiscount = formatCurrency((value * percentage) / 100)

          errors.minOrderAmount = t('coupon.detail.validation.maxDiscountAmountTooSmall', {
            suggestedMinOrder,
            suggestedPercentage,
            suggestedMaxDiscount,
          })
          return false
        }
      }
    }

    errors.minOrderAmount = ''
    return true
  }

  const validateMaxUsageCount = (): boolean => {
    const value = Number(form.value.totalUsages)
    const requiredError = validateRequired(
      form.value.totalUsages,
      t('coupon.detail.validation.totalUsagesRequired'),
    )
    if (requiredError || validatePositiveNumber(value, 'invalid')) {
      errors.maxUsageCount = t('coupon.detail.validation.totalUsagesRequired')
      return false
    }

    errors.maxUsageCount = ''
    return true
  }

  const validateMaxUsagePerUser = (): boolean => {
    const value = Number(form.value.maxUsagesPerBuyer)
    const requiredError = validateRequired(
      form.value.maxUsagesPerBuyer,
      t('coupon.detail.validation.maxUsagesPerBuyerRequired'),
    )
    if (requiredError || validatePositiveNumber(value, 'invalid')) {
      errors.maxUsagePerUser = t('coupon.detail.validation.maxUsagesPerBuyerRequired')
      return false
    }

    errors.maxUsagePerUser = ''
    return true
  }

  const validateAllFields = (): boolean => {
    errors.common = []

    const results = [
      validateName(),
      validateCode(),
      validateStartDateTime(),
      validateEndDateTime(),
      validateEarlySaveDateTime(),
      validateDiscountAmount(),
      validateMaxDiscountAmount(),
      validateMinOrderAmount(),
      validateMaxUsageCount(),
      validateMaxUsagePerUser(),
    ]

    return results.every(Boolean)
  }

  return {
    validateName,
    validateCode,
    validateStartDateTime,
    validateEndDateTime,
    validateEarlySaveDateTime,
    validateDiscountAmount,
    validateMaxDiscountAmount,
    validateMinOrderAmount,
    validateMaxUsageCount,
    validateMaxUsagePerUser,
    validateAllFields,
  }
}

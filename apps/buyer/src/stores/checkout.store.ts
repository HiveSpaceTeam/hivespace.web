import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  buildPaymentAttemptIdempotencyKey,
  normalizeCurrencyCode,
  normalizeMoneyDisplay,
  type CurrencyCodeInput,
  type MoneyIssue,
  type NormalizableMoney,
} from '@hivespace/shared'
import { checkoutService } from '@/services/checkout.service'
import { cartService } from '@/services/cart.service'
import { paymentService } from '@/services/payment.service'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { isStoreCouponEqual, arePlatformCouponsEqual, areInvalidCouponsEqual } from './coupon-equality'
import type { PaymentAttempt, PaymentMethodMetadata, PaymentMethodCode } from '@hivespace/shared'
import type {
  AppliedPlatformCoupon,
  CheckoutItem,
  CheckoutPreview,
  CheckoutRequest,
  CheckoutResult,
  DeliveryPackage,
  InvalidAppliedCoupon,
} from '@/types'

const resolveMoneyIssue = (currencyCode: CurrencyCodeInput): MoneyIssue | null =>
  normalizeCurrencyCode(currencyCode) ? null : { code: 'missing_currency' }

const normalizeCheckoutItem = (item: CheckoutItem): CheckoutItem => {
  const price = normalizeMoneyDisplay(item.price as NormalizableMoney, { currencyCode: item.currencyCode ?? item.currency })
  const originalPrice = normalizeMoneyDisplay(item.originalPrice as NormalizableMoney, {
    currencyCode: item.currencyCode ?? item.currency ?? price.currencyCode,
  })
  const lineTotal = normalizeMoneyDisplay(item.lineTotal as NormalizableMoney, {
    currencyCode: item.currencyCode ?? item.currency ?? price.currencyCode,
  })
  const currencyCode = price.currencyCode
    ?? lineTotal.currencyCode
    ?? normalizeCurrencyCode(item.currencyCode ?? item.currency)

  return {
    ...item,
    originalPrice: originalPrice.amount ?? undefined,
    price: price.amount ?? 0,
    currency: item.currency ?? currencyCode,
    currencyCode,
    moneyIssue: price.issue ?? lineTotal.issue ?? item.moneyIssue ?? resolveMoneyIssue(currencyCode),
    lineTotal: lineTotal.amount ?? 0,
  }
}

const normalizeDeliveryPackage = (pkg: DeliveryPackage): DeliveryPackage => {
  const shippingFee = normalizeMoneyDisplay(pkg.shippingFee as NormalizableMoney, {
    currencyCode: pkg.currencyCode ?? pkg.currency,
  })
  const originalShippingFee = normalizeMoneyDisplay(pkg.originalShippingFee as NormalizableMoney, {
    currencyCode: pkg.currencyCode ?? pkg.currency ?? shippingFee.currencyCode,
  })
  const subtotal = normalizeMoneyDisplay(pkg.subtotal as NormalizableMoney, {
    currencyCode: pkg.currencyCode ?? pkg.currency ?? shippingFee.currencyCode,
  })
  const originalSubtotal = normalizeMoneyDisplay(pkg.originalSubtotal as NormalizableMoney, {
    currencyCode: pkg.currencyCode ?? pkg.currency ?? subtotal.currencyCode,
  })
  const packageTotal = normalizeMoneyDisplay(pkg.packageTotal as NormalizableMoney, {
    currencyCode: pkg.currencyCode ?? pkg.currency ?? subtotal.currencyCode,
  })
  const currencyCode = shippingFee.currencyCode
    ?? subtotal.currencyCode
    ?? normalizeCurrencyCode(pkg.currencyCode ?? pkg.currency)

  return {
    ...pkg,
    originalShippingFee: originalShippingFee.amount ?? undefined,
    shippingFee: shippingFee.amount ?? 0,
    currency: pkg.currency ?? currencyCode,
    currencyCode,
    moneyIssue: shippingFee.issue ?? subtotal.issue ?? pkg.moneyIssue ?? resolveMoneyIssue(currencyCode),
    originalSubtotal: originalSubtotal.amount ?? 0,
    subtotal: subtotal.amount ?? 0,
    packageTotal: packageTotal.amount ?? 0,
    items: pkg.items.map(normalizeCheckoutItem),
  }
}

const normalizePreview = (response: CheckoutPreview): CheckoutPreview => {
  const subtotal = normalizeMoneyDisplay(response.subtotal as NormalizableMoney, {
    currencyCode: response.currencyCode ?? response.currency,
  })
  const originalSubtotal = normalizeMoneyDisplay(response.originalSubtotal as NormalizableMoney, {
    currencyCode: response.currencyCode ?? response.currency ?? subtotal.currencyCode,
  })
  const totalShippingFee = normalizeMoneyDisplay(response.totalShippingFee as NormalizableMoney, {
    currencyCode: response.currencyCode ?? response.currency ?? subtotal.currencyCode,
  })
  const grandTotal = normalizeMoneyDisplay(response.grandTotal as NormalizableMoney, {
    currencyCode: response.currencyCode ?? response.currency ?? subtotal.currencyCode,
  })
  const currencyCode = subtotal.currencyCode
    ?? grandTotal.currencyCode
    ?? normalizeCurrencyCode(response.currencyCode ?? response.currency)

  return {
    ...response,
    originalSubtotal: originalSubtotal.amount ?? 0,
    subtotal: subtotal.amount ?? 0,
    currency: response.currency ?? currencyCode,
    currencyCode,
    moneyIssue: subtotal.issue ?? grandTotal.issue ?? response.moneyIssue ?? resolveMoneyIssue(currencyCode),
    totalShippingFee: totalShippingFee.amount ?? 0,
    grandTotal: grandTotal.amount ?? 0,
    packages: response.packages.map(normalizeDeliveryPackage),
  }
}

const areCheckoutItemsEqual = (left: CheckoutItem, right: CheckoutItem) =>
  left.cartItemId === right.cartItemId &&
  left.productId === right.productId &&
  left.skuId === right.skuId &&
  left.productName === right.productName &&
  left.imageUrl === right.imageUrl &&
  left.skuAttributes === right.skuAttributes &&
  left.originalPrice === right.originalPrice &&
  left.price === right.price &&
  left.currency === right.currency &&
  left.currencyCode === right.currencyCode &&
  left.quantity === right.quantity &&
  left.lineTotal === right.lineTotal &&
  left.moneyIssue?.code === right.moneyIssue?.code

const areDeliveryPackagesEqual = (left: DeliveryPackage, right: DeliveryPackage) =>
  left.storeId === right.storeId &&
  left.storeName === right.storeName &&
  left.shippingType === right.shippingType &&
  left.originalShippingFee === right.originalShippingFee &&
  left.shippingFee === right.shippingFee &&
  left.currency === right.currency &&
  left.currencyCode === right.currencyCode &&
  left.originalSubtotal === right.originalSubtotal &&
  left.subtotal === right.subtotal &&
  left.packageTotal === right.packageTotal &&
  left.moneyIssue?.code === right.moneyIssue?.code &&
  isStoreCouponEqual(left.appliedStoreCoupon, right.appliedStoreCoupon)

const isPreviewMetaEqual = (left: CheckoutPreview, right: CheckoutPreview) =>
  left.originalSubtotal === right.originalSubtotal &&
  left.subtotal === right.subtotal &&
  left.currency === right.currency &&
  left.currencyCode === right.currencyCode &&
  left.totalShippingFee === right.totalShippingFee &&
  left.grandTotal === right.grandTotal &&
  left.totalItems === right.totalItems &&
  left.moneyIssue?.code === right.moneyIssue?.code

const patchCheckoutItem = (target: CheckoutItem, source: CheckoutItem) => {
  target.cartItemId = source.cartItemId
  target.productId = source.productId
  target.skuId = source.skuId
  target.productName = source.productName
  target.imageUrl = source.imageUrl
  target.skuAttributes = source.skuAttributes
  target.originalPrice = source.originalPrice
  target.price = source.price
  target.currency = source.currency
  target.currencyCode = source.currencyCode
  target.quantity = source.quantity
  target.lineTotal = source.lineTotal
  target.moneyIssue = source.moneyIssue
}

const patchDeliveryPackage = (target: DeliveryPackage, source: DeliveryPackage) => {
  target.storeId = source.storeId
  target.storeName = source.storeName
  target.shippingType = source.shippingType
  target.originalShippingFee = source.originalShippingFee
  target.shippingFee = source.shippingFee
  target.currency = source.currency
  target.currencyCode = source.currencyCode
  target.originalSubtotal = source.originalSubtotal
  target.subtotal = source.subtotal
  target.packageTotal = source.packageTotal
  target.appliedStoreCoupon = source.appliedStoreCoupon
  target.moneyIssue = source.moneyIssue
}

export const useCheckoutStore = defineStore('checkout', () => {
  const preview = ref<CheckoutPreview | null>(null)
  const platformCoupons = ref<AppliedPlatformCoupon[]>([])
  const invalidatedCoupons = ref<InvalidAppliedCoupon[]>([])
  const paymentMethods = ref<PaymentMethodMetadata[]>([])
  const checkoutPaymentId = ref<string | null>(null)
  const paymentReferenceNo = ref<string | null>(null)
  const latestPaymentAttempt = ref<PaymentAttempt | null>(null)
  const isLoading = ref(false)
  const isRefreshing = ref(false)
  const { isLoading: submitting, run: runSubmit } = useAsyncAction()
  let mutationQueue = Promise.resolve()

  const runInitialLoad = async <T>(action: () => Promise<T>) => {
    isLoading.value = true
    try {
      return await action()
    } finally {
      isLoading.value = false
    }
  }

  const runRefresh = async <T>(action: () => Promise<T>) => {
    isRefreshing.value = true
    try {
      return await action()
    } finally {
      isRefreshing.value = false
    }
  }

  const syncPackageItems = (targetPackage: DeliveryPackage, nextPackage: DeliveryPackage) => {
    const existingItemsById = new Map(
      targetPackage.items.map(item => [item.cartItemId, item] as const),
    )

    let hasChanges = targetPackage.items.length !== nextPackage.items.length

    const nextItems = nextPackage.items.map((nextItem, index) => {
      const existingItem = existingItemsById.get(nextItem.cartItemId)
      if (!existingItem) {
        hasChanges = true
        return nextItem
      }

      if (!areCheckoutItemsEqual(existingItem, nextItem)) {
        patchCheckoutItem(existingItem, nextItem)
        hasChanges = true
      }

      if (targetPackage.items[index] !== existingItem) {
        hasChanges = true
      }

      return existingItem
    })

    if (hasChanges) {
      targetPackage.items.splice(0, targetPackage.items.length, ...nextItems)
    }
  }

  const syncPackages = (nextPackages: DeliveryPackage[]) => {
    const currentPreview = preview.value
    if (!currentPreview) {
      return
    }

    const existingPackagesById = new Map(
      currentPreview.packages.map(pkg => [pkg.storeId, pkg] as const),
    )

    let hasChanges = currentPreview.packages.length !== nextPackages.length

    const mergedPackages = nextPackages.map((nextPackage, index) => {
      const existingPackage = existingPackagesById.get(nextPackage.storeId)
      if (!existingPackage) {
        hasChanges = true
        return nextPackage
      }

      if (!areDeliveryPackagesEqual(existingPackage, nextPackage)) {
        patchDeliveryPackage(existingPackage, nextPackage)
        hasChanges = true
      }

      syncPackageItems(existingPackage, nextPackage)

      if (currentPreview.packages[index] !== existingPackage) {
        hasChanges = true
      }

      return existingPackage
    })

    if (hasChanges) {
      currentPreview.packages.splice(0, currentPreview.packages.length, ...mergedPackages)
    }
  }

  const syncPreviewMeta = (nextPreview: CheckoutPreview) => {
    if (!preview.value) {
      return
    }

    if (isPreviewMetaEqual(preview.value, nextPreview)) {
      return
    }

    preview.value.originalSubtotal = nextPreview.originalSubtotal
    preview.value.subtotal = nextPreview.subtotal
    preview.value.currency = nextPreview.currency
    preview.value.currencyCode = nextPreview.currencyCode
    preview.value.totalShippingFee = nextPreview.totalShippingFee
    preview.value.grandTotal = nextPreview.grandTotal
    preview.value.totalItems = nextPreview.totalItems
    preview.value.moneyIssue = nextPreview.moneyIssue
  }

  const syncPlatformCoupons = (nextCoupons: AppliedPlatformCoupon[]) => {
    if (arePlatformCouponsEqual(platformCoupons.value, nextCoupons)) {
      return
    }

    platformCoupons.value.splice(0, platformCoupons.value.length, ...nextCoupons)
  }

  const syncInvalidatedCoupons = (nextCoupons: InvalidAppliedCoupon[]) => {
    if (areInvalidCouponsEqual(invalidatedCoupons.value, nextCoupons)) {
      return
    }

    invalidatedCoupons.value.splice(0, invalidatedCoupons.value.length, ...nextCoupons)
  }

  const applyPreviewState = (response: CheckoutPreview) => {
    if (!preview.value) {
      preview.value = {
        ...response,
        packages: response.packages.map(pkg => ({
          ...pkg,
          items: [...pkg.items],
        })),
      }
      syncPlatformCoupons(response.platformCoupons)
      syncInvalidatedCoupons(response.invalidatedCoupons)
      return
    }

    syncPackages(response.packages)
    syncPreviewMeta(response)
    syncPlatformCoupons(response.platformCoupons)
    syncInvalidatedCoupons(response.invalidatedCoupons)
  }

  const fetchPreviewInternal = async () => normalizePreview(await checkoutService.getPreview({}))

  const sortMethods = (methods: PaymentMethodMetadata[]) =>
    [...methods].sort((left, right) => left.sortOrder - right.sortOrder)

  const loadPaymentMethods = async () => {
    const response = await paymentService.getPaymentMethods()
    paymentMethods.value = sortMethods(response.methods)
    return paymentMethods.value
  }

  const loadInitialPreview = async () => {
    const response = await runInitialLoad(async () => {
      const [previewResponse] = await Promise.all([
        fetchPreviewInternal(),
        loadPaymentMethods(),
      ])
      return previewResponse
    })
    applyPreviewState(response)
    return response
  }

  const fetchPreview = async () => {
    const response = await runRefresh(fetchPreviewInternal)
    applyPreviewState(response)
    return response
  }

  const runMutationAndRefresh = async (
    action: () => Promise<unknown>,
  ): Promise<CheckoutPreview> => {
    const execute = async () =>
      runRefresh(async () => {
        await action()
        const response = await fetchPreviewInternal()
        applyPreviewState(response)
        return response
      })

    const queuedAction = mutationQueue.then(execute, execute)
    mutationQueue = queuedAction.then(
      () => undefined,
      () => undefined,
    )
    return queuedAction
  }

  const applyStoreCoupon = async (storeId: string, code: string) =>
    runMutationAndRefresh(() => cartService.applyStoreCoupon(storeId, code))

  const applyPlatformCoupon = async (code: string) =>
    runMutationAndRefresh(() => cartService.applyPlatformCoupon(code))

  const removePlatformCoupon = async (code: string) =>
    runMutationAndRefresh(() => cartService.removePlatformCoupon(code))

  const removeStoreCoupon = async (storeId: string) =>
    runMutationAndRefresh(() => cartService.removeStoreCoupon(storeId))

  const resetPreview = () => {
    preview.value = null
    platformCoupons.value = []
    invalidatedCoupons.value = []
    checkoutPaymentId.value = null
    paymentReferenceNo.value = null
    latestPaymentAttempt.value = null
  }

  const applyCheckoutPaymentState = (result: CheckoutResult) => {
    checkoutPaymentId.value = result.paymentId ?? checkoutPaymentId.value
    paymentReferenceNo.value = result.paymentReferenceNo ?? result.referenceNo ?? paymentReferenceNo.value
    latestPaymentAttempt.value = result.latestAttempt ?? latestPaymentAttempt.value
  }

  const submitCheckout = async (request: CheckoutRequest): Promise<CheckoutResult> =>
    runSubmit(async () => {
      const result = await checkoutService.initiateCheckout(request)
      const grandTotal = normalizeMoneyDisplay(result.grandTotal as NormalizableMoney)
      const normalizedResult = {
        ...result,
        grandTotal: grandTotal.amount ?? 0,
      }
      applyCheckoutPaymentState(normalizedResult)
      return normalizedResult
    })

  const retryPaymentAttempt = async (methodCode?: PaymentMethodCode) => {
    if (!checkoutPaymentId.value) {
      throw new Error('Missing checkout payment')
    }
    const resolvedMethodCode = methodCode ?? latestPaymentAttempt.value?.methodCode
    if (!resolvedMethodCode) {
      throw new Error('Missing payment method')
    }

    const result = await runSubmit(() =>
      paymentService.createPaymentAttempt(checkoutPaymentId.value!, {
        methodCode: resolvedMethodCode,
        idempotencyKey: buildPaymentAttemptIdempotencyKey(checkoutPaymentId.value!),
      }),
    )
    checkoutPaymentId.value = result.paymentId
    paymentReferenceNo.value = result.referenceNo
    latestPaymentAttempt.value = result.attempt
    return result
  }

  const packages = computed(() => preview.value?.packages ?? [])
  const totalItems = computed(() => preview.value?.totalItems ?? 0)
  const subtotal = computed(() => preview.value?.subtotal ?? 0)
  const originalSubtotal = computed(() => preview.value?.originalSubtotal ?? 0)
  const totalShippingFee = computed(() => preview.value?.totalShippingFee ?? 0)
  const grandTotal = computed(() => preview.value?.grandTotal ?? 0)
  const shippingDiscount = computed(() =>
    packages.value.reduce(
      (sum, pkg) => sum + ((pkg.originalShippingFee ?? pkg.shippingFee) - pkg.shippingFee),
      0,
    ),
  )
  const totalSaved = computed(() => originalSubtotal.value - subtotal.value + shippingDiscount.value)
  const checkoutSelectablePaymentMethods = computed(() =>
    paymentMethods.value.filter(method => method.isEnabled && method.isCheckoutSelectable),
  )

  return {
    preview,
    isLoading,
    isRefreshing,
    submitting,
    platformCoupons,
    invalidatedCoupons,
    paymentMethods,
    checkoutSelectablePaymentMethods,
    checkoutPaymentId,
    paymentReferenceNo,
    latestPaymentAttempt,
    loadInitialPreview,
    loadPaymentMethods,
    fetchPreview,
    applyStoreCoupon,
    applyPlatformCoupon,
    removePlatformCoupon,
    removeStoreCoupon,
    resetPreview,
    submitCheckout,
    retryPaymentAttempt,
    packages,
    totalItems,
    subtotal,
    originalSubtotal,
    totalShippingFee,
    grandTotal,
    shippingDiscount,
    totalSaved,
  }
})

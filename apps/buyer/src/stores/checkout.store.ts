import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { checkoutService } from '@/services/checkout.service'
import { cartService } from '@/services/cart.service'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type {
  AppliedPlatformCoupon,
  CheckoutItem,
  CheckoutPreview,
  CheckoutRequest,
  CheckoutResult,
  DeliveryPackage,
  InvalidAppliedCoupon,
} from '@/types'

const isStoreCouponEqual = (
  left?: DeliveryPackage['appliedStoreCoupon'],
  right?: DeliveryPackage['appliedStoreCoupon'],
) => {
  if (!left && !right) return true
  if (!left || !right) return false

  return left.storeId === right.storeId && left.couponCode === right.couponCode
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
  left.quantity === right.quantity &&
  left.lineTotal === right.lineTotal

const areDeliveryPackagesEqual = (left: DeliveryPackage, right: DeliveryPackage) =>
  left.storeId === right.storeId &&
  left.storeName === right.storeName &&
  left.shippingType === right.shippingType &&
  left.originalShippingFee === right.originalShippingFee &&
  left.shippingFee === right.shippingFee &&
  left.currency === right.currency &&
  left.originalSubtotal === right.originalSubtotal &&
  left.subtotal === right.subtotal &&
  left.packageTotal === right.packageTotal &&
  isStoreCouponEqual(left.appliedStoreCoupon, right.appliedStoreCoupon)

const arePlatformCouponsEqual = (
  left: AppliedPlatformCoupon[],
  right: AppliedPlatformCoupon[],
) =>
  left.length === right.length &&
  left.every((coupon, index) => coupon.couponCode === right[index]?.couponCode)

const areInvalidCouponsEqual = (
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

const isPreviewMetaEqual = (left: CheckoutPreview, right: CheckoutPreview) =>
  left.originalSubtotal === right.originalSubtotal &&
  left.subtotal === right.subtotal &&
  left.currency === right.currency &&
  left.totalShippingFee === right.totalShippingFee &&
  left.grandTotal === right.grandTotal &&
  left.totalItems === right.totalItems

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
  target.quantity = source.quantity
  target.lineTotal = source.lineTotal
}

const patchDeliveryPackage = (target: DeliveryPackage, source: DeliveryPackage) => {
  target.storeId = source.storeId
  target.storeName = source.storeName
  target.shippingType = source.shippingType
  target.originalShippingFee = source.originalShippingFee
  target.shippingFee = source.shippingFee
  target.currency = source.currency
  target.originalSubtotal = source.originalSubtotal
  target.subtotal = source.subtotal
  target.packageTotal = source.packageTotal
  target.appliedStoreCoupon = source.appliedStoreCoupon
}

export const useCheckoutStore = defineStore('checkout', () => {
  const preview = ref<CheckoutPreview | null>(null)
  const platformCoupons = ref<AppliedPlatformCoupon[]>([])
  const invalidatedCoupons = ref<InvalidAppliedCoupon[]>([])
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
    preview.value.totalShippingFee = nextPreview.totalShippingFee
    preview.value.grandTotal = nextPreview.grandTotal
    preview.value.totalItems = nextPreview.totalItems
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

  const fetchPreviewInternal = () => checkoutService.getPreview({})

  const loadInitialPreview = async () => {
    const response = await runInitialLoad(fetchPreviewInternal)
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
  }

  const submitCheckout = async (request: CheckoutRequest): Promise<CheckoutResult> =>
    runSubmit(() => checkoutService.initiateCheckout(request))

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

  return {
    preview,
    isLoading,
    isRefreshing,
    submitting,
    platformCoupons,
    invalidatedCoupons,
    loadInitialPreview,
    fetchPreview,
    applyStoreCoupon,
    applyPlatformCoupon,
    removePlatformCoupon,
    removeStoreCoupon,
    resetPreview,
    submitCheckout,
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

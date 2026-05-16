import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAppStore } from '@hivespace/shared'
import i18n from '@/i18n'
import { cartService } from '@/services/cart.service'
import type {
  AddCartItemRequest,
  AddCartItemResponse,
  AppliedPlatformCoupon,
  CartGroup,
  CartItem,
  CartItemResponse,
  CartStoreGroupResponse,
  CartSummary,
  GetCartSummaryResponse,
  InvalidAppliedCoupon,
} from '@/types'

const CART_SUMMARY_PAGE_SIZE = 10

const parseSkuAttributes = (raw: string): string => {
  try {
    const attrs = JSON.parse(raw) as Record<string, string>
    return Object.entries(attrs)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ')
  } catch {
    return raw
  }
}

const mapApiItem = (item: CartItemResponse): CartItem => ({
  id: item.cartItemId,
  cartItemId: item.cartItemId,
  productId: item.productId,
  skuId: item.skuId,
  name: item.productName ?? '',
  image: item.skuImageUrl || item.productThumbnailUrl || '',
  price: item.price ?? 0,
  originalPrice: item.originalPrice ?? undefined,
  quantity: item.quantity,
  variant: item.skuAttributes ? parseSkuAttributes(item.skuAttributes) : undefined,
  selected: item.isSelected,
})

const mapApiGroup = (group: CartStoreGroupResponse): CartGroup => ({
  storeId: group.storeId,
  storeName: group.storeName,
  storeStatus: group.storeStatus,
  isMall: group.isMall,
  selected: group.isSelected,
  appliedStoreCoupon: group.appliedStoreCoupon,
  items: group.items.map(mapApiItem),
})

const isStoreCouponEqual = (
  left?: CartGroup['appliedStoreCoupon'],
  right?: CartGroup['appliedStoreCoupon'],
) => {
  if (!left && !right) return true
  if (!left || !right) return false

  return left.storeId === right.storeId && left.couponCode === right.couponCode
}

const areCartItemsEqual = (left: CartItem, right: CartItem) =>
  left.id === right.id &&
  left.cartItemId === right.cartItemId &&
  left.productId === right.productId &&
  left.skuId === right.skuId &&
  left.name === right.name &&
  left.image === right.image &&
  left.price === right.price &&
  left.originalPrice === right.originalPrice &&
  left.quantity === right.quantity &&
  left.variant === right.variant &&
  left.selected === right.selected &&
  left.isFreeShipping === right.isFreeShipping &&
  left.isReturn === right.isReturn

const areCartGroupsEqual = (left: CartGroup, right: CartGroup) =>
  left.storeId === right.storeId &&
  left.storeName === right.storeName &&
  left.storeStatus === right.storeStatus &&
  left.isMall === right.isMall &&
  left.selected === right.selected &&
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

const isSummaryEqual = (left: CartSummary, right: CartSummary) =>
  left.discountAmount === right.discountAmount &&
  left.subTotal === right.subTotal &&
  left.total === right.total

const patchItem = (target: CartItem, source: CartItem) => {
  target.id = source.id
  target.cartItemId = source.cartItemId
  target.productId = source.productId
  target.skuId = source.skuId
  target.name = source.name
  target.image = source.image
  target.price = source.price
  target.originalPrice = source.originalPrice
  target.quantity = source.quantity
  target.variant = source.variant
  target.selected = source.selected
  target.isFreeShipping = source.isFreeShipping
  target.isReturn = source.isReturn
}

const patchGroup = (target: CartGroup, source: CartGroup) => {
  target.storeId = source.storeId
  target.storeName = source.storeName
  target.storeStatus = source.storeStatus
  target.isMall = source.isMall
  target.selected = source.selected
  target.appliedStoreCoupon = source.appliedStoreCoupon
}

export const useCartStore = defineStore('cart', () => {
  const cartGroups = ref<CartGroup[]>([])
  const selectedCount = ref(0)
  const summary = ref<CartSummary>({
    discountAmount: 0,
    subTotal: 0,
    total: 0,
  })
  const platformCoupons = ref<AppliedPlatformCoupon[]>([])
  const invalidatedCoupons = ref<InvalidAppliedCoupon[]>([])
  const hasMore = ref(false)
  const loadedPages = ref(0)
  const isLoading = ref(false)
  const isRefreshing = ref(false)
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

  const syncGroupItems = (targetGroup: CartGroup, nextGroup: CartGroup) => {
    const existingItemsById = new Map(
      targetGroup.items.map(item => [item.cartItemId, item] as const),
    )

    let hasChanges = targetGroup.items.length !== nextGroup.items.length

    const nextItems = nextGroup.items.map((nextItem, index) => {
      const existingItem = existingItemsById.get(nextItem.cartItemId)
      if (!existingItem) {
        hasChanges = true
        return nextItem
      }

      if (!areCartItemsEqual(existingItem, nextItem)) {
        patchItem(existingItem, nextItem)
        hasChanges = true
      }

      if (targetGroup.items[index] !== existingItem) {
        hasChanges = true
      }

      return existingItem
    })

    if (hasChanges) {
      targetGroup.items.splice(0, targetGroup.items.length, ...nextItems)
    }
  }

  const syncCartGroups = (nextGroups: CartGroup[], append: boolean) => {
    if (append) {
      const existingGroupsById = new Map(
        cartGroups.value.map(group => [group.storeId, group] as const),
      )

      nextGroups.forEach(nextGroup => {
        const existingGroup = existingGroupsById.get(nextGroup.storeId)
        if (!existingGroup) {
          cartGroups.value.push(nextGroup)
          return
        }

        if (!areCartGroupsEqual(existingGroup, nextGroup)) {
          patchGroup(existingGroup, nextGroup)
        }

        syncGroupItems(existingGroup, nextGroup)
      })

      return
    }

    const existingGroupsById = new Map(
      cartGroups.value.map(group => [group.storeId, group] as const),
    )

    let hasChanges = cartGroups.value.length !== nextGroups.length

    const mergedGroups = nextGroups.map((nextGroup, index) => {
      const existingGroup = existingGroupsById.get(nextGroup.storeId)
      if (!existingGroup) {
        hasChanges = true
        return nextGroup
      }

      if (!areCartGroupsEqual(existingGroup, nextGroup)) {
        patchGroup(existingGroup, nextGroup)
        hasChanges = true
      }

      syncGroupItems(existingGroup, nextGroup)

      if (cartGroups.value[index] !== existingGroup) {
        hasChanges = true
      }

      return existingGroup
    })

    if (hasChanges) {
      cartGroups.value.splice(0, cartGroups.value.length, ...mergedGroups)
    }
  }

  const syncSummary = (nextSummary: CartSummary) => {
    if (isSummaryEqual(summary.value, nextSummary)) {
      return
    }

    summary.value.discountAmount = nextSummary.discountAmount
    summary.value.subTotal = nextSummary.subTotal
    summary.value.total = nextSummary.total
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

  const syncHasMore = (nextHasMore: boolean) => {
    if (hasMore.value !== nextHasMore) {
      hasMore.value = nextHasMore
    }
  }

  const syncSelectedCount = () => {
    const nextSelectedCount = cartGroups.value.reduce(
      (sum, group) => sum + group.items.filter(item => item.selected).length,
      0,
    )

    if (selectedCount.value !== nextSelectedCount) {
      selectedCount.value = nextSelectedCount
    }
  }

  const applySummaryState = (response: GetCartSummaryResponse, append: boolean) => {
    const nextGroups = response.stores.map(mapApiGroup)
    syncCartGroups(nextGroups, append)
    syncSummary(response.summary)
    syncPlatformCoupons(response.platformCoupons)
    syncInvalidatedCoupons(response.invalidatedCoupons)
    syncHasMore(response.hasMore)
    syncSelectedCount()
  }

  const fetchCartSummaryPage = (page: number) =>
    cartService.getCartSummary({
      page,
      pageSize: CART_SUMMARY_PAGE_SIZE,
    })

  const loadCartSummaryPage = async (
    page: number,
    append = false,
    withInitialLoading = false,
  ) => {
    const request = () =>
      fetchCartSummaryPage(page)

    const response = withInitialLoading
      ? await runInitialLoad(request)
      : await request()

    applySummaryState(response, append)
    loadedPages.value = page
    return response
  }

  const reloadLoadedPagesInternal = async () => {
    const pageCount = Math.max(loadedPages.value, 1)
    let lastResponse: GetCartSummaryResponse | null = null
    const stores: CartStoreGroupResponse[] = []

    for (let page = 1; page <= pageCount; page += 1) {
      lastResponse = await fetchCartSummaryPage(page)
      stores.push(...lastResponse.stores)
    }

    if (lastResponse) {
      applySummaryState(
        {
          ...lastResponse,
          stores,
        },
        false,
      )
    }

    return lastResponse
  }

  const reloadLoadedPages = async () =>
    runRefresh(reloadLoadedPagesInternal)

  const loadInitialCartSummary = async () => {
    loadedPages.value = 0
    cartGroups.value = []
    return loadCartSummaryPage(1, false, true)
  }

  const loadMoreCartSummary = async () => {
    if (!hasMore.value) return null
    return loadCartSummaryPage(loadedPages.value + 1, true)
  }

  const runMutationAndRefresh = async (
    action: () => Promise<unknown>,
  ): Promise<GetCartSummaryResponse | null> => {
    const execute = async () =>
      runRefresh(async () => {
      await action()
      return reloadLoadedPagesInternal()
    })

    const queuedAction = mutationQueue.then(execute, execute)
    mutationQueue = queuedAction.then(
      () => undefined,
      () => undefined,
    )
    return queuedAction
  }

  const applyPlatformCoupon = async (couponCode: string) =>
    runMutationAndRefresh(() => cartService.applyPlatformCoupon(couponCode))

  const removePlatformCoupon = async (couponCode: string) =>
    runMutationAndRefresh(() => cartService.removePlatformCoupon(couponCode))

  const applyStoreCoupon = async (storeId: string, couponCode: string) =>
    runMutationAndRefresh(() => cartService.applyStoreCoupon(storeId, couponCode))

  const removeStoreCoupon = async (storeId: string) =>
    runMutationAndRefresh(() => cartService.removeStoreCoupon(storeId))

  const syncItem = async (item: CartItem) => {
    try {
      return await runMutationAndRefresh(() =>
        cartService.updateCartItems({
          selectAll: null,
          items: [
            {
              cartItemId: item.cartItemId,
              skuId: item.skuId,
              quantity: item.quantity,
              isSelected: item.selected,
            },
          ],
        }),
      )
    } catch (error) {
      useAppStore().notifyError('cart.errors.syncFailed')
      throw error
    }
  }

  const syncItems = async (items: CartItem[], selectAll: boolean | null = null) => {
    if (items.length === 0) return
    try {
      return await runMutationAndRefresh(() =>
        cartService.updateCartItems({
          selectAll,
          items: items.map(i => ({
            cartItemId: i.cartItemId,
            skuId: i.skuId,
            quantity: i.quantity,
            isSelected: i.selected,
          })),
        }),
      )
    } catch (error) {
      useAppStore().notifyError('cart.errors.syncFailed')
      throw error
    }
  }

  const removeItem = async (cartItemId: string) => {
    try {
      return await runMutationAndRefresh(() => cartService.removeCartItem(cartItemId))
    } catch (error) {
      useAppStore().notifyError('cart.errors.removeFailed')
      throw error
    }
  }

  const removeItems = async (cartItemIds: string[]) => {
    if (cartItemIds.length === 0) return null
    try {
      return await runMutationAndRefresh(() =>
        Promise.all(cartItemIds.map(id => cartService.removeCartItem(id))).then(() => undefined),
      )
    } catch (error) {
      useAppStore().notifyError('cart.errors.removeFailed')
      throw error
    }
  }

  const fetchSelectedCount = async () => {
    try {
      const response = await cartService.getSelectedItemsCount()
      selectedCount.value = response.count
    } catch {
      // silently ignore - badge stays at last known value
    }
  }

  const addItem = async (payload: AddCartItemRequest): Promise<AddCartItemResponse> => {
    const response = await cartService.addCartItem(payload)
    await fetchSelectedCount()
    useAppStore().notifySuccess(i18n.global.t('storefront.cart.addToCartSuccess'))
    return response
  }

  return {
    addItem,
    cartGroups,
    fetchSelectedCount,
    hasMore,
    invalidatedCoupons,
    isLoading,
    isRefreshing,
    loadInitialCartSummary,
    loadMoreCartSummary,
    loadedPages,
    platformCoupons,
    reloadLoadedPages,
    removeItem,
    removeItems,
    removePlatformCoupon,
    removeStoreCoupon,
    selectedCount,
    summary,
    syncItem,
    syncItems,
    applyPlatformCoupon,
    applyStoreCoupon,
  }
})

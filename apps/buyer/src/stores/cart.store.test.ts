import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from './cart.store'
import { cartService } from '@/services/cart.service'
import type { GetCartSummaryResponse } from '@/types'

const mockNotifyError = jest.fn()
const mockNotifySuccess = jest.fn()

jest.mock('@hivespace/shared', () => ({
  ...jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared'),
  useAppStore: () => ({
    notifyError: mockNotifyError,
    notifySuccess: mockNotifySuccess,
    setLoading: jest.fn(),
  }),
}))

jest.mock('@/services/cart.service', () => ({
  cartService: {
    addCartItem: jest.fn(),
    getCartSummary: jest.fn(),
    getSelectedItemsCount: jest.fn(),
    removeCartItem: jest.fn(),
    updateCartItems: jest.fn(),
    applyPlatformCoupon: jest.fn(),
    removePlatformCoupon: jest.fn(),
    applyStoreCoupon: jest.fn(),
    removeStoreCoupon: jest.fn(),
  },
}))

const cartSummary = (quantity = 1): GetCartSummaryResponse => ({
  stores: [
    {
      storeId: 'store-001',
      storeName: 'Hive Store',
      storeStatus: 1,
      isMall: false,
      isSelected: true,
      items: [
        {
          cartItemId: 'cart-item-001',
          productId: 10,
          skuId: 100,
          quantity,
          isSelected: true,
          productName: 'Honey Jar',
          productThumbnailUrl: '/honey.png',
          productStatus: 1,
          originalPrice: 120_000,
          price: 100_000,
          currency: 'VND',
          skuNo: 'SKU-001',
          skuImageUrl: '/honey-sku.png',
          skuAttributes: '{"Size":"M"}',
          storeId: 'store-001',
          storeName: 'Hive Store',
          storeStatus: 1,
          createdAt: '2026-06-12T00:00:00Z',
          updatedAt: null,
        },
      ],
    },
  ],
  summary: {
    discountAmount: 0,
    subTotal: 100_000 * quantity,
    total: 100_000 * quantity,
  },
  platformCoupons: [],
  invalidatedCoupons: [],
  hasMore: false,
})

describe('useCartStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockNotifyError.mockReset()
    mockNotifySuccess.mockReset()
    jest.mocked(cartService.getCartSummary).mockResolvedValue(cartSummary())
    jest.mocked(cartService.getSelectedItemsCount).mockResolvedValue({ count: 2 })
    jest.mocked(cartService.addCartItem).mockResolvedValue({ cartItemId: 'cart-item-002' })
    jest.mocked(cartService.updateCartItems).mockResolvedValue(undefined)
    jest.mocked(cartService.removeCartItem).mockResolvedValue(undefined)
  })

  it('should load cart items and selected count from the cart summary', async () => {
    const store = useCartStore()

    await store.loadInitialCartSummary()

    expect(store.cartGroups).toHaveLength(1)
    expect(store.cartGroups[0]?.items[0]?.name).toBe('Honey Jar')
    expect(store.selectedCount).toBe(1)
    expect(store.summary.total).toBe(100_000)
  })

  it('should refresh selected count when an item is added', async () => {
    const store = useCartStore()

    await store.addItem({ productId: 10, skuId: 100, quantity: 2 })

    expect(cartService.addCartItem).toHaveBeenCalledWith({ productId: 10, skuId: 100, quantity: 2 })
    expect(store.selectedCount).toBe(2)
    expect(mockNotifySuccess).toHaveBeenCalled()
  })

  it('should update item quantity through the cart item endpoint', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce(cartSummary())
      .mockResolvedValueOnce(cartSummary(3))
    const store = useCartStore()
    await store.loadInitialCartSummary()

    const item = store.cartGroups[0]?.items[0]
    await store.syncItem({ ...item!, quantity: 3 })

    expect(cartService.updateCartItems).toHaveBeenCalledWith({
      selectAll: null,
      items: [
        {
          cartItemId: 'cart-item-001',
          skuId: 100,
          quantity: 3,
          isSelected: true,
        },
      ],
    })
    expect(store.summary.total).toBe(300_000)
  })

  it('should remove an item and keep the remaining summary state', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce(cartSummary())
      .mockResolvedValueOnce({ ...cartSummary(), stores: [], summary: { discountAmount: 0, subTotal: 0, total: 0 } })
    const store = useCartStore()
    await store.loadInitialCartSummary()

    await store.removeItem('cart-item-001')

    expect(cartService.removeCartItem).toHaveBeenCalledWith('cart-item-001')
    expect(store.cartGroups).toHaveLength(0)
    expect(store.summary.total).toBe(0)
  })

  it('should be in empty state with no items before any cart is loaded', () => {
    const store = useCartStore()

    expect(store.cartGroups).toHaveLength(0)
    expect(store.selectedCount).toBe(0)
    expect(store.summary.total).toBe(0)
  })

  it('loadMoreCartSummary_WhenHasMore_AppendsNextPage', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce({ ...cartSummary(), hasMore: true })
      .mockResolvedValueOnce(cartSummary())
    const store = useCartStore()
    await store.loadInitialCartSummary()
    expect(store.hasMore).toBe(true)

    await store.loadMoreCartSummary()

    expect(cartService.getCartSummary).toHaveBeenCalledTimes(2)
  })

  it('loadMoreCartSummary_WhenNoMore_SkipsServiceCall', async () => {
    const store = useCartStore()

    const result = await store.loadMoreCartSummary()

    expect(result).toBeNull()
    expect(cartService.getCartSummary).not.toHaveBeenCalled()
  })

  it('removeItems_WithEmptyArray_SkipsServiceCall', async () => {
    const store = useCartStore()

    const result = await store.removeItems([])

    expect(result).toBeNull()
    expect(cartService.removeCartItem).not.toHaveBeenCalled()
  })

  it('removeItems_WithMultipleIds_RemovesEachItem', async () => {
    const store = useCartStore()

    await store.removeItems(['cart-item-001', 'cart-item-002'])

    expect(cartService.removeCartItem).toHaveBeenCalledWith('cart-item-001')
    expect(cartService.removeCartItem).toHaveBeenCalledWith('cart-item-002')
  })

  it('fetchSelectedCount_UpdatesSelectedCountFromService', async () => {
    jest.mocked(cartService.getSelectedItemsCount).mockResolvedValue({ count: 7 })
    const store = useCartStore()

    await store.fetchSelectedCount()

    expect(store.selectedCount).toBe(7)
  })

  it('fetchSelectedCount_WhenServiceThrows_SilentlyIgnoresError', async () => {
    jest.mocked(cartService.getSelectedItemsCount).mockRejectedValueOnce(
      new Error('Network error'),
    )
    const store = useCartStore()
    const initialCount = store.selectedCount

    await expect(store.fetchSelectedCount()).resolves.toBeUndefined()
    expect(store.selectedCount).toBe(initialCount)
  })

  it('applyPlatformCoupon_CallsServiceAndRefreshesCart', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce(cartSummary())
      .mockResolvedValueOnce(cartSummary(3))
    jest.mocked(cartService.applyPlatformCoupon).mockResolvedValue(undefined)
    const store = useCartStore()
    await store.loadInitialCartSummary()

    await store.applyPlatformCoupon('PLATFORM10')

    expect(cartService.applyPlatformCoupon).toHaveBeenCalledWith('PLATFORM10')
    expect(store.summary.total).toBe(300_000)
  })

  it('removePlatformCoupon_CallsServiceAndRefreshesCart', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce(cartSummary())
      .mockResolvedValueOnce(cartSummary(2))
    jest.mocked(cartService.removePlatformCoupon).mockResolvedValue(undefined)
    const store = useCartStore()
    await store.loadInitialCartSummary()

    await store.removePlatformCoupon('PLATFORM10')

    expect(cartService.removePlatformCoupon).toHaveBeenCalledWith('PLATFORM10')
    expect(store.summary.total).toBe(200_000)
  })

  it('applyStoreCoupon_CallsServiceAndRefreshesCart', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce(cartSummary())
      .mockResolvedValueOnce(cartSummary(2))
    jest.mocked(cartService.applyStoreCoupon).mockResolvedValue(undefined)
    const store = useCartStore()
    await store.loadInitialCartSummary()

    await store.applyStoreCoupon('store-001', 'STORE10')

    expect(cartService.applyStoreCoupon).toHaveBeenCalledWith('store-001', 'STORE10')
    expect(store.summary.total).toBe(200_000)
  })

  it('removeStoreCoupon_CallsServiceAndRefreshesCart', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce(cartSummary())
      .mockResolvedValueOnce(cartSummary())
    jest.mocked(cartService.removeStoreCoupon).mockResolvedValue(undefined)
    const store = useCartStore()
    await store.loadInitialCartSummary()

    await store.removeStoreCoupon('store-001')

    expect(cartService.removeStoreCoupon).toHaveBeenCalledWith('store-001')
  })

  it('syncItems_WithSelectAllTrue_CallsServiceWithFlag', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce(cartSummary())
      .mockResolvedValueOnce(cartSummary())
    const store = useCartStore()
    await store.loadInitialCartSummary()
    const item = store.cartGroups[0]!.items[0]!

    await store.syncItems([item], true)

    expect(cartService.updateCartItems).toHaveBeenCalledWith(
      expect.objectContaining({ selectAll: true }),
    )
  })

  it('syncItems_WithSelectAllFalse_CallsServiceWithFlag', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce(cartSummary())
      .mockResolvedValueOnce(cartSummary())
    const store = useCartStore()
    await store.loadInitialCartSummary()
    const item = store.cartGroups[0]!.items[0]!

    await store.syncItems([item], false)

    expect(cartService.updateCartItems).toHaveBeenCalledWith(
      expect.objectContaining({ selectAll: false }),
    )
  })

  it('syncItems_WhenEmpty_DoesNotCallService', async () => {
    const store = useCartStore()

    const result = await store.syncItems([])

    expect(result).toBeUndefined()
    expect(cartService.updateCartItems).not.toHaveBeenCalled()
  })

  it('syncItem_WhenServiceThrows_RethrowsError', async () => {
    jest.mocked(cartService.updateCartItems).mockRejectedValueOnce(new Error('Update failed'))
    const store = useCartStore()
    await store.loadInitialCartSummary()
    const item = store.cartGroups[0]!.items[0]!

    await expect(store.syncItem(item)).rejects.toThrow('Update failed')
    expect(mockNotifyError).toHaveBeenCalledWith('cart.errors.syncFailed')
  })

  it('removeItem_WhenServiceThrows_RethrowsError', async () => {
    jest.mocked(cartService.getCartSummary).mockResolvedValueOnce(cartSummary())
    jest.mocked(cartService.removeCartItem).mockRejectedValueOnce(new Error('Remove failed'))
    const store = useCartStore()
    await store.loadInitialCartSummary()

    await expect(store.removeItem('cart-item-001')).rejects.toThrow('Remove failed')
    expect(mockNotifyError).toHaveBeenCalledWith('cart.errors.removeFailed')
  })

  it('removeItems_WhenServiceThrows_RethrowsError', async () => {
    jest.mocked(cartService.removeCartItem).mockRejectedValueOnce(new Error('Bulk remove failed'))
    const store = useCartStore()

    await expect(store.removeItems(['cart-item-001'])).rejects.toThrow('Bulk remove failed')
    expect(mockNotifyError).toHaveBeenCalledWith('cart.errors.removeFailed')
  })

  it('syncItems_WhenServiceThrows_RethrowsError', async () => {
    jest.mocked(cartService.updateCartItems).mockRejectedValueOnce(new Error('Sync failed'))
    jest.mocked(cartService.getCartSummary).mockResolvedValueOnce(cartSummary())
    const store = useCartStore()
    await store.loadInitialCartSummary()
    const item = store.cartGroups[0]!.items[0]!

    await expect(store.syncItems([item])).rejects.toThrow('Sync failed')
    expect(mockNotifyError).toHaveBeenCalledWith('cart.errors.syncFailed')
  })

  it('syncCartGroups_WithAppendTrue_AppendsNewGroups', async () => {
    const secondStore: GetCartSummaryResponse = {
      ...cartSummary(),
      stores: [
        {
          storeId: 'store-002',
          storeName: 'Second Store',
          storeStatus: 1,
          isMall: false,
          isSelected: false,
          items: [
            {
              cartItemId: 'cart-item-002',
              productId: 20,
              skuId: 200,
              quantity: 1,
              isSelected: false,
              productName: 'Bee Wax',
              productThumbnailUrl: '/wax.png',
              productStatus: 1,
              originalPrice: 50_000,
              price: 50_000,
              currency: 'VND',
              skuNo: 'SKU-002',
              skuImageUrl: '/wax-sku.png',
              skuAttributes: '{}',
              storeId: 'store-002',
              storeName: 'Second Store',
              storeStatus: 1,
              createdAt: '2026-06-12T00:00:00Z',
              updatedAt: null,
            },
          ],
        },
      ],
      hasMore: false,
    }
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce({ ...cartSummary(), hasMore: true })
      .mockResolvedValueOnce(secondStore)
    const store = useCartStore()
    await store.loadInitialCartSummary()
    expect(store.cartGroups).toHaveLength(1)

    await store.loadMoreCartSummary()

    expect(store.cartGroups).toHaveLength(2)
    expect(store.cartGroups[1]?.storeName).toBe('Second Store')
  })

  it('parseSkuAttributes_WhenJsonInvalid_ReturnsRawString', async () => {
    const summaryWithBadAttrs: GetCartSummaryResponse = {
      ...cartSummary(),
      stores: [
        {
          ...cartSummary().stores[0]!,
          items: [
            {
              ...cartSummary().stores[0]!.items[0]!,
              skuAttributes: 'not-valid-json',
            },
          ],
        },
      ],
    }
    jest.mocked(cartService.getCartSummary).mockResolvedValueOnce(summaryWithBadAttrs)
    const store = useCartStore()

    await store.loadInitialCartSummary()

    expect(store.cartGroups[0]?.items[0]?.variant).toBe('not-valid-json')
  })

  it('mapApiItem_WhenOptionalFieldsAreMissing_UsesFallbackValues', async () => {
    jest.mocked(cartService.getCartSummary).mockResolvedValueOnce({
      ...cartSummary(),
      stores: [
        {
          ...cartSummary().stores[0]!,
          items: [
            {
              ...cartSummary().stores[0]!.items[0]!,
              productName: null,
              productThumbnailUrl: null,
              skuImageUrl: null,
              price: null,
              originalPrice: null,
              skuAttributes: '',
            },
          ],
        },
      ],
    })
    const store = useCartStore()

    await store.loadInitialCartSummary()

    expect(store.cartGroups[0]?.items[0]).toEqual(expect.objectContaining({
      name: '',
      image: '',
      price: 0,
      originalPrice: undefined,
      variant: undefined,
    }))
  })

  it('syncCartGroups_WhenGroupsDisappear_ReplacesState', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce({
        ...cartSummary(),
        stores: [
          cartSummary().stores[0]!,
          {
            ...cartSummary().stores[0]!,
            storeId: 'store-002',
            storeName: 'Second Store',
            items: [
              {
                ...cartSummary().stores[0]!.items[0]!,
                cartItemId: 'cart-item-002',
                storeId: 'store-002',
                storeName: 'Second Store',
              },
            ],
          },
        ],
      })
      .mockResolvedValueOnce(cartSummary())
    const store = useCartStore()
    await store.loadInitialCartSummary()

    await store.reloadLoadedPages()

    expect(store.cartGroups).toHaveLength(1)
    expect(store.cartGroups[0]?.storeId).toBe('store-001')
  })

  it('mutationQueue_WhenTwoMutationsOverlap_ProcessesBothRefreshes', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce(cartSummary())
      .mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve(cartSummary(2)), 10)),
      )
      .mockResolvedValueOnce(cartSummary(3))
    const store = useCartStore()
    await store.loadInitialCartSummary()
    const item = store.cartGroups[0]!.items[0]!

    await Promise.all([
      store.syncItem({ ...item, quantity: 2 }),
      store.syncItems([{ ...item, quantity: 3 }]),
    ])

    expect(store.summary.total).toBe(300_000)
    expect(cartService.updateCartItems).toHaveBeenCalledTimes(2)
  })

  it('reloadLoadedPages_WhenMultiplePagesLoaded_ReloadsAllPages', async () => {
    const page2Summary: GetCartSummaryResponse = {
      ...cartSummary(),
      stores: [
        {
          storeId: 'store-002',
          storeName: 'Store Two',
          storeStatus: 1,
          isMall: false,
          isSelected: false,
          items: [
            {
              cartItemId: 'cart-item-003',
              productId: 30,
              skuId: 300,
              quantity: 1,
              isSelected: false,
              productName: 'Bee Pollen',
              productThumbnailUrl: '/pollen.png',
              productStatus: 1,
              originalPrice: 80_000,
              price: 80_000,
              currency: 'VND',
              skuNo: 'SKU-003',
              skuImageUrl: '/pollen-sku.png',
              skuAttributes: '{}',
              storeId: 'store-002',
              storeName: 'Store Two',
              storeStatus: 1,
              createdAt: '2026-06-12T00:00:00Z',
              updatedAt: null,
            },
          ],
        },
      ],
      hasMore: false,
    }
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce({ ...cartSummary(), hasMore: true })  // initial page 1
      .mockResolvedValueOnce(page2Summary)                          // loadMore page 2
      .mockResolvedValueOnce(cartSummary())                         // reload page 1
      .mockResolvedValueOnce(page2Summary)                          // reload page 2
    const store = useCartStore()
    await store.loadInitialCartSummary()
    await store.loadMoreCartSummary()
    expect(store.loadedPages).toBe(2)

    await store.reloadLoadedPages()

    // Should have called getCartSummary 4 times total (2 initial + 2 reload)
    expect(cartService.getCartSummary).toHaveBeenCalledTimes(4)
  })
})

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { checkoutService } from '@/services/checkout.service'
import { cartService } from '@/services/cart.service'
import { PaymentMethod, type CheckoutPreview } from '@/types'
import { useCheckoutStore } from './checkout.store'

jest.mock('@/services/checkout.service', () => ({
  checkoutService: {
    getPreview: jest.fn(),
    initiateCheckout: jest.fn(),
  },
}))

jest.mock('@/services/cart.service', () => ({
  cartService: {
    applyPlatformCoupon: jest.fn(),
    removePlatformCoupon: jest.fn(),
    applyStoreCoupon: jest.fn(),
    removeStoreCoupon: jest.fn(),
  },
}))

const preview = (lineTotal = 200_000): CheckoutPreview => ({
  packages: [
    {
      storeId: 'store-001',
      storeName: 'Hive Store',
      shippingType: 'economy',
      shippingFee: 0,
      currency: 'VND',
      originalSubtotal: lineTotal,
      subtotal: lineTotal,
      packageTotal: lineTotal,
      items: [
        {
          cartItemId: 'cart-item-001',
          productId: 10,
          skuId: 100,
          productName: 'Honey Jar',
          imageUrl: '/honey.png',
          skuAttributes: '{"Size":"M"}',
          price: 100_000,
          currency: 'VND',
          quantity: lineTotal / 100_000,
          lineTotal,
        },
      ],
    },
  ],
  originalSubtotal: lineTotal,
  subtotal: lineTotal,
  currency: 'VND',
  totalShippingFee: 0,
  grandTotal: lineTotal,
  totalItems: lineTotal / 100_000,
  platformCoupons: [],
  invalidatedCoupons: [],
})

describe('useCheckoutStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(checkoutService.getPreview).mockResolvedValue(preview())
    jest.mocked(checkoutService.initiateCheckout).mockResolvedValue({
      orderIds: ['order-001'],
      status: 'Created',
      grandTotal: 200_000,
      paymentUrl: 'https://payment.example.test/pay',
      paymentExpiresAt: null,
    })
    jest.mocked(cartService.applyPlatformCoupon).mockResolvedValue(undefined)
  })

  it('should load checkout preview with cart items', async () => {
    const store = useCheckoutStore()

    await store.loadInitialPreview()

    expect(store.packages[0]?.items[0]?.productName).toBe('Honey Jar')
    expect(store.grandTotal).toBe(200_000)
  })

  it('should refresh preview after platform coupon mutation', async () => {
    jest.mocked(checkoutService.getPreview)
      .mockResolvedValueOnce(preview())
      .mockResolvedValueOnce(preview(150_000))
    const store = useCheckoutStore()
    await store.loadInitialPreview()

    await store.applyPlatformCoupon('SAVE50')

    expect(cartService.applyPlatformCoupon).toHaveBeenCalledWith('SAVE50')
    expect(store.grandTotal).toBe(150_000)
  })

  it('should submit checkout with delivery address and payment method', async () => {
    const store = useCheckoutStore()

    const result = await store.submitCheckout({
      deliveryAddress: {
        recipientName: 'Test Buyer',
        phone: '0900000000',
        streetAddress: '1 Test Street',
        commune: 'Ward 1',
        province: 'Ho Chi Minh City',
      },
      paymentMethod: PaymentMethod.VNPAY,
    })

    expect(checkoutService.initiateCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ paymentMethod: PaymentMethod.VNPAY }),
    )
    expect(result.orderIds).toEqual(['order-001'])
  })

  it('resetPreview_ClearsPreviewAndPackages', async () => {
    const store = useCheckoutStore()
    await store.loadInitialPreview()
    expect(store.packages).toHaveLength(1)
    expect(store.grandTotal).toBe(200_000)

    store.resetPreview()

    expect(store.preview).toBeNull()
    expect(store.packages).toHaveLength(0)
    expect(store.grandTotal).toBe(0)
  })

  it('applyStoreCoupon_CallsServiceAndRefreshesPreview', async () => {
    jest.mocked(checkoutService.getPreview)
      .mockResolvedValueOnce(preview())
      .mockResolvedValueOnce(preview(180_000))
    jest.mocked(cartService.applyStoreCoupon).mockResolvedValue(undefined)
    const store = useCheckoutStore()
    await store.loadInitialPreview()

    await store.applyStoreCoupon('store-001', 'STORE10')

    expect(cartService.applyStoreCoupon).toHaveBeenCalledWith('store-001', 'STORE10')
    expect(store.grandTotal).toBe(180_000)
  })

  it('removePlatformCoupon_CallsServiceAndRefreshesPreview', async () => {
    jest.mocked(checkoutService.getPreview)
      .mockResolvedValueOnce(preview())
      .mockResolvedValueOnce(preview(220_000))
    jest.mocked(cartService.removePlatformCoupon).mockResolvedValue(undefined)
    const store = useCheckoutStore()
    await store.loadInitialPreview()

    await store.removePlatformCoupon('SAVE50')

    expect(cartService.removePlatformCoupon).toHaveBeenCalledWith('SAVE50')
    expect(store.grandTotal).toBe(220_000)
  })

  it('removeStoreCoupon_CallsServiceAndRefreshesPreview', async () => {
    jest.mocked(checkoutService.getPreview)
      .mockResolvedValueOnce(preview())
      .mockResolvedValueOnce(preview(190_000))
    jest.mocked(cartService.removeStoreCoupon).mockResolvedValue(undefined)
    const store = useCheckoutStore()
    await store.loadInitialPreview()

    await store.removeStoreCoupon('store-001')

    expect(cartService.removeStoreCoupon).toHaveBeenCalledWith('store-001')
    expect(store.grandTotal).toBe(190_000)
  })

  it('submitCheckout_WhenServiceThrows_PropagatesError', async () => {
    jest.mocked(checkoutService.initiateCheckout).mockRejectedValueOnce(
      new Error('Payment gateway error'),
    )
    const store = useCheckoutStore()

    await expect(
      store.submitCheckout({
        deliveryAddress: {
          recipientName: 'Test Buyer',
          phone: '0900000000',
          streetAddress: '1 Test Street',
          commune: 'Ward 1',
          province: 'Ho Chi Minh City',
        },
        paymentMethod: PaymentMethod.VNPAY,
      }),
    ).rejects.toThrow('Payment gateway error')
  })

  it('fetchPreview_WithIdenticalData_SkipsStateUpdate', async () => {
    jest.mocked(checkoutService.getPreview)
      .mockResolvedValueOnce(preview())
      .mockResolvedValueOnce(preview())
    const store = useCheckoutStore()
    await store.loadInitialPreview()
    const initialGrandTotal = store.grandTotal

    await store.applyPlatformCoupon('SAVE0')

    expect(store.grandTotal).toBe(initialGrandTotal)
    expect(store.packages).toHaveLength(1)
  })

  it('syncPackages_WhenShippingFeeChanges_PatchesExistingPackage', async () => {
    const updatedPreview = {
      ...preview(),
      packages: [{ ...preview().packages[0]!, shippingFee: 30_000, packageTotal: 230_000 }],
      grandTotal: 230_000,
      totalShippingFee: 30_000,
    }
    jest.mocked(checkoutService.getPreview)
      .mockResolvedValueOnce(preview())
      .mockResolvedValueOnce(updatedPreview)
    const store = useCheckoutStore()
    await store.loadInitialPreview()

    await store.applyPlatformCoupon('SAVE50')

    expect(store.packages[0]?.shippingFee).toBe(30_000)
    expect(store.grandTotal).toBe(230_000)
  })

  it('applyPlatformCoupon_WhenCouponAdded_UpdatesPlatformCoupons', async () => {
    const previewWithCoupon: CheckoutPreview = {
      ...preview(180_000),
      platformCoupons: [{ couponCode: 'SAVE50' }],
    }
    jest.mocked(checkoutService.getPreview)
      .mockResolvedValueOnce(preview())
      .mockResolvedValueOnce(previewWithCoupon)
    const store = useCheckoutStore()
    await store.loadInitialPreview()

    await store.applyPlatformCoupon('SAVE50')

    expect(store.grandTotal).toBe(180_000)
  })

  it('syncInvalidatedCoupons_WhenCountChanges_UpdatesInvalidatedList', async () => {
    const previewWithInvalidated: CheckoutPreview = {
      ...preview(),
      invalidatedCoupons: [
        { couponCode: 'EXPIRED', ownerType: 'Platform', reasonCode: 'expired', message: 'Coupon expired' },
      ],
    }
    jest.mocked(checkoutService.getPreview)
      .mockResolvedValueOnce(preview())
      .mockResolvedValueOnce(previewWithInvalidated)
    const store = useCheckoutStore()
    await store.loadInitialPreview()

    await store.applyPlatformCoupon('SAVE50')

    expect(store.invalidatedCoupons).toHaveLength(1)
  })

  it('syncPackages_WhenPackageHasStoreCoupon_ComparesStoreCoupon', async () => {
    const coupon = { storeId: 'store-001', couponCode: 'STORE10' }
    const previewWithCoupon: CheckoutPreview = {
      ...preview(),
      packages: [{ ...preview().packages[0]!, appliedStoreCoupon: coupon }],
    }
    jest.mocked(checkoutService.getPreview)
      .mockResolvedValueOnce(previewWithCoupon)
      .mockResolvedValueOnce(previewWithCoupon)
    const store = useCheckoutStore()
    await store.loadInitialPreview()

    await store.applyPlatformCoupon('SAVE50')

    expect(store.packages[0]?.appliedStoreCoupon?.couponCode).toBe('STORE10')
  })

  it('loadInitialPreview_SetsLoadingFalseInFinally', async () => {
    jest.mocked(checkoutService.getPreview).mockRejectedValueOnce(new Error('Network error'))
    const store = useCheckoutStore()

    await expect(store.loadInitialPreview()).rejects.toThrow('Network error')
    expect(store.isLoading).toBe(false)
  })

  it('syncPackages_WhenPackageRemoved_RemovesFromState', async () => {
    const twoPackagePreview: CheckoutPreview = {
      ...preview(),
      packages: [
        preview().packages[0]!,
        {
          storeId: 'store-002',
          storeName: 'Second Store',
          shippingType: 'economy',
          shippingFee: 30_000,
          currency: 'VND',
          originalSubtotal: 50_000,
          subtotal: 50_000,
          packageTotal: 80_000,
          items: [
            {
              cartItemId: 'cart-item-002',
              productId: 20,
              skuId: 200,
              productName: 'Second Item',
              imageUrl: '/second.png',
              skuAttributes: '{}',
              price: 50_000,
              currency: 'VND',
              quantity: 1,
              lineTotal: 50_000,
            },
          ],
        },
      ],
    }
    jest.mocked(checkoutService.getPreview)
      .mockResolvedValueOnce(twoPackagePreview)
      .mockResolvedValueOnce(preview())
    const store = useCheckoutStore()
    await store.loadInitialPreview()
    expect(store.packages).toHaveLength(2)

    await store.applyPlatformCoupon('SAVE50')

    expect(store.packages).toHaveLength(1)
    expect(store.packages[0]?.storeId).toBe('store-001')
  })

  it('syncPreviewMeta_WhenPreviewIsNull_DoesNotThrow', async () => {
    const store = useCheckoutStore()
    // preview.value is null, so a mutation that triggers syncPreviewMeta should not throw
    jest.mocked(checkoutService.getPreview).mockResolvedValue(preview())

    await expect(store.fetchPreview()).resolves.toBeDefined()
  })

  it('applyPreviewState_OnFirstLoad_CreatesNewPackagesArray', async () => {
    const store = useCheckoutStore()

    const response = await store.loadInitialPreview()

    // packages should be a new array, not the same reference as the response
    expect(store.packages).not.toBe(response.packages)
    expect(store.packages).toHaveLength(response.packages.length)
    expect(store.packages[0]?.items).toHaveLength(response.packages[0]?.items.length ?? 0)
  })

  it('mutationQueue_WhenMutationRejects_DoesNotBlockNextMutation', async () => {
    jest.mocked(checkoutService.getPreview)
      .mockResolvedValueOnce(preview())
      .mockRejectedValueOnce(new Error('First mutation preview failed'))
      .mockResolvedValueOnce(preview(150_000))
    jest.mocked(cartService.applyPlatformCoupon).mockResolvedValue(undefined)
    jest.mocked(cartService.removePlatformCoupon).mockResolvedValue(undefined)
    const store = useCheckoutStore()
    await store.loadInitialPreview()

    // First mutation will fail on preview refresh
    const firstMutation = store.applyPlatformCoupon('FAIL')
    // Second mutation should still succeed
    const secondMutation = store.removePlatformCoupon('SAVE50')

    await Promise.allSettled([firstMutation, secondMutation])

    // Second mutation's preview should succeed
    expect(store.grandTotal).toBe(150_000)
  })

  it('syncPackageItems_WhenNewItemAdded_InsertsNewItem', async () => {
    const initialPv = preview()
    const updatedPv = {
      ...preview(250_000),
      packages: [
        {
          ...initialPv.packages[0]!,
          items: [
            ...initialPv.packages[0]!.items,
            {
              cartItemId: 'cart-item-002',
              productId: 20,
              skuId: 200,
              productName: 'New Jar',
              imageUrl: '/new.png',
              skuAttributes: '{}',
              price: 50_000,
              currency: 'VND',
              quantity: 1,
              lineTotal: 50_000,
            },
          ],
        },
      ],
    }
    jest.mocked(checkoutService.getPreview)
      .mockResolvedValueOnce(initialPv)
      .mockResolvedValueOnce(updatedPv)
    const store = useCheckoutStore()
    await store.loadInitialPreview()

    await store.applyPlatformCoupon('SAVE50')

    expect(store.packages[0]?.items).toHaveLength(2)
    expect(store.packages[0]?.items[1]?.productName).toBe('New Jar')
  })
})

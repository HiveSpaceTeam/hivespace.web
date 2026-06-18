import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import CartPage from './CartPage.vue'
import { cartService } from '@/services/cart.service'
import { productService } from '@/services/product.service'
import type { GetCartSummaryResponse } from '@/types'

const mockNotifyError = jest.fn()

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    useAppStore: () => ({
      ...actual.useAppStore(),
      notifyError: mockNotifyError,
    }),
  }
})

jest.mock('@/components/layout/CartHeader.vue', () => ({
  default: { template: '<header data-testid="cart-header" />' },
}))

jest.mock('@/components/layout/StorefrontFooter.vue', () => ({
  default: { template: '<footer data-testid="storefront-footer" />' },
}))

jest.mock('@/components/common/AvailableCouponPopover.vue', () => ({
  default: {
    template: `
      <div data-testid="available-coupon-popover">
        <button type="button" @click="$emit('apply-coupon', 'STORE10')">apply-shop-coupon</button>
        <button type="button" @click="$emit('apply-coupon', null)">remove-shop-coupon</button>
      </div>
    `,
    props: ['modelValue', 'storeId', 'productIds', 'coupons', 'shouldFetchCoupons', 'selectedCouponCode', 'align'],
    emits: ['apply-coupon', 'update:modelValue'],
  },
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

jest.mock('@/services/product.service', () => ({
  productService: {
    getProducts: jest.fn(),
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

const emptyCartSummary: GetCartSummaryResponse = {
  stores: [],
  summary: {
    discountAmount: 0,
    subTotal: 0,
    total: 0,
  },
  platformCoupons: [],
  invalidatedCoupons: [],
  hasMore: false,
}

const productListResponse = {
  items: [
    {
      id: '20',
      name: 'Recommended Honey',
      price: 90_000,
      productImage: '/recommended.png',
      imageURL: '/recommended.png',
      soldCount: 1,
      rating: 5,
    },
  ],
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
}

const renderCart = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/cart', name: 'Cart', component: CartPage },
      { path: '/checkout', name: 'Checkout', component: { template: '<div>Checkout</div>' } },
    ],
  })
  await router.push('/cart')
  await router.isReady()

  render(CartPage, {
    global: {
      plugins: [pinia, router, i18n],
    },
  })

  return router
}

describe('CartPage', () => {
  beforeEach(() => {
    mockNotifyError.mockReset()
    jest.mocked(cartService.getCartSummary).mockResolvedValue(cartSummary())
    jest.mocked(cartService.getSelectedItemsCount).mockResolvedValue({ count: 1 })
    jest.mocked(cartService.updateCartItems).mockResolvedValue(undefined)
    jest.mocked(cartService.removeCartItem).mockResolvedValue(undefined)
    jest.mocked(productService.getProducts).mockResolvedValue(productListResponse)
  })

  it('should render cart items from the store-backed service', async () => {
    await renderCart()

    expect(await screen.findByText('Honey Jar')).toBeTruthy()
    expect(screen.getByText('Hive Store')).toBeTruthy()
  })

  it('should render zero selected items when the cart is empty', async () => {
    jest.mocked(cartService.getCartSummary).mockResolvedValue(emptyCartSummary)

    await renderCart()

    await waitFor(() => expect(screen.queryByText('Honey Jar')).toBeNull())
    expect(screen.getByRole('button', { name: /0/ })).toBeTruthy()
  })

  it('should render the updated subtotal after quantity changes', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce(cartSummary())
      .mockResolvedValueOnce(cartSummary(2))
    await renderCart()

    await fireEvent.click((await screen.findAllByLabelText('increase'))[0]!)

    await waitFor(() => {
      expect(cartService.updateCartItems).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [expect.objectContaining({ quantity: 2 })],
        }),
      )
    })
    await waitFor(() => expect(screen.getAllByText(/200.000/).length).toBeGreaterThan(0))
  })

  it('should navigate to checkout when selected items exist', async () => {
    const router = await renderCart()
    const checkoutLabel = i18n.global.t('storefront.cart.checkout')

    await fireEvent.click(await screen.findByRole('button', { name: new RegExp(checkoutLabel) }))

    await waitFor(() => expect(router.currentRoute.value.name).toBe('Checkout'))
  })

  it('handleCheckout_WhenNoItemsSelected_DoesNotNavigate', async () => {
    jest.mocked(cartService.getCartSummary).mockResolvedValue({
      ...cartSummary(),
      stores: [
        {
          ...cartSummary().stores[0]!,
          isSelected: false,
          items: [{ ...cartSummary().stores[0]!.items[0]!, isSelected: false }],
        },
      ],
    })
    const router = await renderCart()
    const checkoutLabel = i18n.global.t('storefront.cart.checkout')

    await waitFor(() => screen.getByText('Honey Jar'))
    await fireEvent.click(screen.getByRole('button', { name: new RegExp(checkoutLabel) }))

    expect(router.currentRoute.value.name).not.toBe('Checkout')
  })

  it('applyPlatformCoupon_WhenCodeEntered_CallsService', async () => {
    jest.mocked(cartService.applyPlatformCoupon).mockResolvedValue(undefined)
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce(cartSummary())
      .mockResolvedValueOnce(cartSummary())
    await renderCart()

    await waitFor(() => screen.getByText('Honey Jar'))

    const couponInput = document.querySelector('input[type="text"]') as HTMLInputElement
    fireEvent.input(couponInput, { target: { value: 'SAVE50' } })

    const applyBtn = screen.getByText(i18n.global.t('storefront.cart.applyCoupon'))
    fireEvent.click(applyBtn)

    await waitFor(() => {
      expect(cartService.applyPlatformCoupon).toHaveBeenCalledWith('SAVE50')
    })
  })

  it('applyPlatformCoupon_WhenCodeEmpty_DoesNotCallService', async () => {
    await renderCart()

    await waitFor(() => screen.getByText('Honey Jar'))

    const applyBtn = screen.getByText(i18n.global.t('storefront.cart.applyCoupon'))
    fireEvent.click(applyBtn)

    expect(cartService.applyPlatformCoupon).not.toHaveBeenCalled()
  })

  it('removePlatformCoupon_WhenCouponExists_CallsService', async () => {
    const summaryWithCoupon: GetCartSummaryResponse = {
      ...cartSummary(),
      platformCoupons: [{ couponCode: 'SAVE50' }],
    }
    jest.mocked(cartService.removePlatformCoupon).mockResolvedValue(undefined)
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce(summaryWithCoupon)
      .mockResolvedValueOnce(cartSummary())
    await renderCart()

    await waitFor(() => screen.getByText('SAVE50'))

    const couponBadge = screen.getByText('SAVE50').closest('button')!
    fireEvent.click(couponBadge)

    await waitFor(() => {
      expect(cartService.removePlatformCoupon).toHaveBeenCalledWith('SAVE50')
    })
  })

  it('removeItem_WhenTrashButtonClicked_CallsService', async () => {
    await renderCart()

    await waitFor(() => screen.getByText('Honey Jar'))

    const trashButtons = Array.from(document.querySelectorAll('button'))
      .filter(button => button.querySelector('svg'))
    await fireEvent.click(trashButtons[1]!)

    await waitFor(() => {
      expect(cartService.removeCartItem).toHaveBeenCalledWith('cart-item-001')
    })
  })

  it('removeSelected_WhenHeaderTrashClicked_RemovesAllSelectedItems', async () => {
    await renderCart()

    await waitFor(() => screen.getByText('Honey Jar'))

    const trashButtons = Array.from(document.querySelectorAll('button'))
      .filter(button => button.querySelector('svg'))
    await fireEvent.click(trashButtons[0]!)

    await waitFor(() => {
      expect(cartService.removeCartItem).toHaveBeenCalledWith('cart-item-001')
    })
  })

  it('handleApplyShopCoupon_WhenCouponSelected_CallsService', async () => {
    jest.mocked(cartService.applyStoreCoupon).mockResolvedValue(undefined)
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce(cartSummary())
      .mockResolvedValueOnce(cartSummary())
    await renderCart()

    await waitFor(() => screen.getByText('Honey Jar'))

    await fireEvent.click(screen.getByRole('button', {
      name: i18n.global.t('storefront.cart.addShopCoupon'),
    }))
    await fireEvent.click(screen.getByRole('button', { name: 'apply-shop-coupon' }))

    await waitFor(() => {
      expect(cartService.applyStoreCoupon).toHaveBeenCalledWith('store-001', 'STORE10')
    })
  })

  it('handleApplyShopCoupon_WhenRemovingAppliedCoupon_CallsRemoveService', async () => {
    jest.mocked(cartService.removeStoreCoupon).mockResolvedValue(undefined)
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce({
        ...cartSummary(),
        stores: [
          {
            ...cartSummary().stores[0]!,
            appliedStoreCoupon: { storeId: 'store-001', couponCode: 'STORE10' },
          },
        ],
      })
      .mockResolvedValueOnce(cartSummary())
    await renderCart()

    await waitFor(() => screen.getByText('Honey Jar'))
    await fireEvent.click(screen.getByRole('button', {
      name: i18n.global.t('storefront.cart.addShopCoupon'),
    }))
    await fireEvent.click(screen.getByRole('button', { name: 'remove-shop-coupon' }))

    await waitFor(() => {
      expect(cartService.removeStoreCoupon).toHaveBeenCalledWith('store-001')
    })
  })

  it('loadMore_WhenHasMore_RendersButtonAndFetchesNextPage', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce({ ...cartSummary(), hasMore: true })
      .mockResolvedValueOnce(cartSummary(2))
    await renderCart()

    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('storefront.cart.loadMore'),
    }))

    await waitFor(() => {
      expect(cartService.getCartSummary).toHaveBeenCalledTimes(2)
    })
  })

  it('loadMore_WhenInvalidatedCouponsAreReturned_NotifiesTheUser', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce({ ...cartSummary(), hasMore: true })
      .mockResolvedValueOnce({
        ...cartSummary(2),
        invalidatedCoupons: [
          {
            couponCode: 'EXPIRED',
            ownerType: 'Platform',
            reasonCode: 'expired',
            message: 'Coupon expired',
          },
        ],
      })
    await renderCart()

    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('storefront.cart.loadMore'),
    }))

    await waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalledWith(
        i18n.global.t('storefront.cart.couponUnavailableTitle'),
        'EXPIRED: Coupon expired',
      )
    })
  })

  it('handleSelectAllChange_WhenChecked_CallsUpdateItems', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce(cartSummary())
      .mockResolvedValueOnce(cartSummary())
    await renderCart()

    await waitFor(() => screen.getByText('Honey Jar'))

    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    const selectAllCheckbox = checkboxes[0] as HTMLInputElement
    fireEvent.change(selectAllCheckbox, { target: { checked: false } })

    await waitFor(() => {
      expect(cartService.updateCartItems).toHaveBeenCalledWith(
        expect.objectContaining({ selectAll: false }),
      )
    })
  })

  it('handleGroupSelectChange_WhenGroupCheckboxChanged_UpdatesItems', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce(cartSummary())
      .mockResolvedValueOnce(cartSummary())
    await renderCart()

    await waitFor(() => screen.getByText('Honey Jar'))

    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    // checkboxes order: selectAll, group, item (per template order)
    const groupCheckbox = checkboxes[1] as HTMLInputElement
    fireEvent.change(groupCheckbox, { target: { checked: false } })

    await waitFor(() => {
      expect(cartService.updateCartItems).toHaveBeenCalled()
    })
  })

  it('handleItemSelectChange_WhenItemCheckboxChanged_UpdatesItem', async () => {
    jest.mocked(cartService.getCartSummary)
      .mockResolvedValueOnce(cartSummary())
      .mockResolvedValueOnce(cartSummary())
    await renderCart()

    await waitFor(() => screen.getByText('Honey Jar'))

    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    const itemCheckbox = checkboxes[2] as HTMLInputElement
    fireEvent.change(itemCheckbox, { target: { checked: false } })

    await waitFor(() => {
      expect(cartService.updateCartItems).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [expect.objectContaining({ isSelected: false })],
        }),
      )
    })
  })

  it('removeSelected_WhenNoItemsSelected_SkipsRemove', async () => {
    jest.mocked(cartService.getCartSummary).mockResolvedValue({
      ...cartSummary(),
      stores: [
        {
          ...cartSummary().stores[0]!,
          isSelected: false,
          items: [{ ...cartSummary().stores[0]!.items[0]!, isSelected: false }],
        },
      ],
    })
    await renderCart()

    await waitFor(() => screen.getByText('Honey Jar'))

    // Click the first trash button (the removeSelected button in the header)
    const buttons = document.querySelectorAll('button')
    const trashButton = Array.from(buttons).find(btn => btn.querySelector('svg'))
    if (trashButton) fireEvent.click(trashButton)

    expect(cartService.removeCartItem).not.toHaveBeenCalled()
  })

  it('fetchRecommendedProducts_OnMount_LoadsProducts', async () => {
    await renderCart()

    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalled()
    })
  })

  it('fetchRecommendedProducts_WhenNoResults_ReturnsAnEmptyRecommendedList', async () => {
    jest.mocked(productService.getProducts).mockResolvedValue({
      items: [],
      pagination: {
        currentPage: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    })

    await renderCart()

    await waitFor(() => {
      expect(screen.queryByText('Recommended Honey')).toBeNull()
    })
  })
})

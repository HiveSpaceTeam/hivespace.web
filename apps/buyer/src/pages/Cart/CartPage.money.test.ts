import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { render, screen } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import CartPage from './CartPage.vue'
import { cartService } from '@/services/cart.service'
import { productService } from '@/services/product.service'
import type { GetCartSummaryResponse } from '@/types'

const formatMoneyMock = jest.fn()

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    useMoneyFormatter: () => ({
      formatMoney: formatMoneyMock,
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
  default: { template: '<div />', props: ['modelValue'] },
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

const cartSummary: GetCartSummaryResponse = {
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
          quantity: 1,
          isSelected: true,
          productName: 'Honey Jar',
          productThumbnailUrl: '/honey.png',
          productStatus: 1,
          originalPrice: 120_000,
          price: 100_000,
          currency: 'USD',
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
    discountAmount: 1000,
    subTotal: 100_000,
    total: 99_000,
  },
  platformCoupons: [],
  invalidatedCoupons: [],
  hasMore: false,
}

const renderCart = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/cart', name: 'Cart', component: CartPage },
      { path: '/checkout', name: 'Checkout', component: { template: '<div />' } },
    ],
  })
  await router.push('/cart')
  await router.isReady()

  render(CartPage, {
    global: {
      plugins: [pinia, router, i18n],
    },
  })
}

describe('CartPage money rendering', () => {
  beforeEach(() => {
    formatMoneyMock.mockReset()
    formatMoneyMock.mockImplementation((value: unknown) => {
      const { currencyCode, issue } = value as {
        currencyCode: string | null
        issue?: { placeholder?: string } | null
      }

      if (issue) {
        return issue.placeholder ?? 'Invalid money'
      }

      return currencyCode === 'USD' ? '$1,000.00' : '$990.00'
    })
    jest.mocked(cartService.getCartSummary).mockResolvedValue(cartSummary)
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
  })

  it('should render shared money metadata consistently', async () => {
    await renderCart()

    expect((await screen.findAllByText('$1,000.00')).length).toBeGreaterThan(0)
    expect(formatMoneyMock).toHaveBeenCalled()
    expect(
      formatMoneyMock.mock.calls.some(([value]) => {
        const money = value as { amount?: number; currencyCode?: string | null } | undefined
        return money?.amount === 100_000 && money.currencyCode === 'USD'
      }),
    ).toBe(true)
    expect(
      formatMoneyMock.mock.calls.some(([value]) => {
        const money = value as { amount?: number; currencyCode?: string | null } | undefined
        return money?.amount === 99_000 && money.currencyCode === 'USD'
      }),
    ).toBe(true)
  })
})

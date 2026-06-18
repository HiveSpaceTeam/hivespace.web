import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import CheckoutPage from './CheckoutPage.vue'
import { addressService } from '@/services/address.service'
import { cartService } from '@/services/cart.service'
import { checkoutService } from '@/services/checkout.service'
import { PaymentMethod, type CheckoutPreview, type UserAddress } from '@/types'

const mockNotifyError = jest.fn()
const mockNotifySuccess = jest.fn()
const mockOpenModal = jest.fn()

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    Badge: {
      template: '<span><slot /></span>',
      props: ['variant', 'size', 'color', 'class'],
    },
    Button: {
      template: '<button :disabled="disabled" :type="type ?? \'button\'"><slot /></button>',
      props: ['disabled', 'type', 'variant', 'size', 'class', 'loading'],
    },
    FullscreenLoader: {
      template: '<div v-if="visible" data-testid="fullscreen-loader">{{ message }}</div>',
      props: ['visible', 'message'],
    },
    RadioGroup: {
      template: `
        <div>
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            @click="$emit('update:modelValue', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      `,
      props: ['modelValue', 'options', 'direction', 'gapClass', 'optionClass'],
      emits: ['update:modelValue'],
    },
    Spinner: {
      template: '<div data-testid="spinner">{{ size }}</div>',
      props: ['size'],
    },
    useAppStore: () => ({
      notifyError: mockNotifyError,
      notifySuccess: mockNotifySuccess,
    }),
    useModal: () => ({
      openModal: mockOpenModal,
    }),
  }
})

jest.mock('@/components/layout/CheckoutHeader.vue', () => ({
  default: { template: '<header data-testid="checkout-header" />' },
}))

jest.mock('@/components/layout/StorefrontFooter.vue', () => ({
  default: { template: '<footer data-testid="storefront-footer" />' },
}))

jest.mock('@/components/common/AvailableCouponPopover.vue', () => ({
  default: {
    template: `
      <div v-if="modelValue" data-testid="available-coupon-popover">
        <button type="button" @click="$emit('apply-coupon', 'STORE10')">apply-store-coupon</button>
        <button type="button" @click="$emit('apply-coupon', null)">remove-store-coupon</button>
      </div>
    `,
    props: ['modelValue', 'storeId', 'productIds', 'coupons', 'selectedCouponCode', 'align'],
    emits: ['apply-coupon', 'update:modelValue'],
  },
}))

jest.mock('@/components/checkout/ChangeAddressModal.vue', () => ({
  default: { template: '<div />' },
}))

jest.mock('@/services/address.service', () => ({
  addressService: {
    getDefaultAddress: jest.fn(),
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

jest.mock('@/services/checkout.service', () => ({
  checkoutService: {
    getPreview: jest.fn(),
    initiateCheckout: jest.fn(),
  },
}))

const checkoutPreview: CheckoutPreview = {
  packages: [
    {
      storeId: 'store-001',
      storeName: 'Hive Store',
      shippingType: 'economy',
      shippingFee: 0,
      currency: 'VND',
      originalSubtotal: 200_000,
      subtotal: 200_000,
      packageTotal: 200_000,
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
          quantity: 2,
          lineTotal: 200_000,
        },
      ],
    },
  ],
  originalSubtotal: 200_000,
  subtotal: 200_000,
  currency: 'VND',
  totalShippingFee: 0,
  grandTotal: 200_000,
  totalItems: 2,
  platformCoupons: [],
  invalidatedCoupons: [],
}

const defaultAddress: UserAddress = {
  id: 'address-001',
  fullName: 'Test Buyer',
  phoneNumber: '0900000000',
  street: '1 Test Street',
  commune: 'Ward 1',
  province: 'Ho Chi Minh City',
  country: 'VN',
  zipCode: '',
  isDefault: true,
}

const alternateAddress: UserAddress = {
  ...defaultAddress,
  id: 'address-002',
  fullName: 'Other Buyer',
  phoneNumber: '0911111111',
  street: '2 Updated Street',
}

const renderCheckout = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/checkout', name: 'Checkout', component: CheckoutPage },
      { path: '/', name: 'Home', component: { template: '<div>Home</div>' } },
      { path: '/payment', name: 'Payment', component: { template: '<div>Payment</div>' } },
    ],
  })
  await router.push('/checkout')
  await router.isReady()

  render(CheckoutPage, {
    global: {
      plugins: [pinia, router, i18n],
    },
  })

  return router
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    mockNotifyError.mockReset()
    mockNotifySuccess.mockReset()
    mockOpenModal.mockReset()
    jest.mocked(checkoutService.getPreview).mockResolvedValue(checkoutPreview)
    jest.mocked(checkoutService.initiateCheckout).mockResolvedValue({
      orderIds: ['order-001'],
      status: 'Created',
      grandTotal: 200_000,
      paymentUrl: null,
      paymentExpiresAt: null,
    })
    jest.mocked(addressService.getDefaultAddress).mockResolvedValue(defaultAddress)
    jest.mocked(cartService.applyPlatformCoupon).mockResolvedValue(undefined)
    jest.mocked(cartService.applyStoreCoupon).mockResolvedValue(undefined)
    jest.mocked(cartService.removePlatformCoupon).mockResolvedValue(undefined)
    jest.mocked(cartService.removeStoreCoupon).mockResolvedValue(undefined)
    sessionStorage.clear()
  })

  it('should render cart items in the checkout order summary', async () => {
    await renderCheckout()

    expect(await screen.findByText('Honey Jar')).toBeTruthy()
  })

  it('should show the required-address validation path when no address is available', async () => {
    jest.mocked(addressService.getDefaultAddress).mockRejectedValue(new Error('missing address'))
    await renderCheckout()

    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('checkout.placeOrder'),
    }))

    expect(checkoutService.initiateCheckout).not.toHaveBeenCalled()
    expect(mockNotifyError).toHaveBeenCalledWith(
      i18n.global.t('checkout.orderFailedTitle'),
      i18n.global.t('checkout.noAddressMessage'),
    )
  })

  it('should submit checkout with the selected address and payment method', async () => {
    await renderCheckout()

    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('checkout.placeOrder'),
    }))

    await waitFor(() => {
      expect(checkoutService.initiateCheckout).toHaveBeenCalledWith({
        deliveryAddress: {
          recipientName: 'Test Buyer',
          phone: '0900000000',
          streetAddress: '1 Test Street, Ward 1',
          commune: 'Ward 1',
          province: 'Ho Chi Minh City',
        },
        paymentMethod: PaymentMethod.COD,
      })
    })
  })

  it('should submit checkout with the selected non-default payment method', async () => {
    await renderCheckout()

    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('checkout.vnPay'),
    }))
    await fireEvent.click(screen.getByRole('button', {
      name: i18n.global.t('checkout.placeOrder'),
    }))

    await waitFor(() => {
      expect(checkoutService.initiateCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: PaymentMethod.VNPAY,
        }),
      )
    })
  })

  it('should update the selected address from the modal result', async () => {
    mockOpenModal.mockResolvedValue(alternateAddress as never)
    await renderCheckout()

    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('checkout.changeAddress'),
    }))

    await waitFor(() => {
      expect(mockOpenModal).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        currentAddressId: 'address-001',
      }))
    })
  })

  it('should apply a store coupon from the coupon popover', async () => {
    jest.mocked(checkoutService.getPreview)
      .mockResolvedValueOnce(checkoutPreview)
      .mockResolvedValueOnce({
        ...checkoutPreview,
        packages: [
          {
            ...checkoutPreview.packages[0]!,
            appliedStoreCoupon: { storeId: 'store-001', couponCode: 'STORE10' },
          },
        ],
      })

    await renderCheckout()

    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('checkout.storeCoupon'),
    }))
    await fireEvent.click(await screen.findByRole('button', { name: 'apply-store-coupon' }))

    await waitFor(() => {
      expect(cartService.applyStoreCoupon).toHaveBeenCalledWith('store-001', 'STORE10')
    })
  })

  it('should remove a store coupon from the coupon popover', async () => {
    jest.mocked(checkoutService.getPreview).mockResolvedValue({
      ...checkoutPreview,
      packages: [
        {
          ...checkoutPreview.packages[0]!,
          appliedStoreCoupon: { storeId: 'store-001', couponCode: 'STORE10' },
        },
      ],
    })

    await renderCheckout()

    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('checkout.storeCoupon'),
    }))
    await fireEvent.click(await screen.findByRole('button', { name: 'remove-store-coupon' }))

    await waitFor(() => {
      expect(cartService.removeStoreCoupon).toHaveBeenCalledWith('store-001')
    })
  })

  it('should apply a platform coupon on enter and remove it from the badge button', async () => {
    jest.mocked(checkoutService.getPreview)
      .mockResolvedValueOnce(checkoutPreview)
      .mockResolvedValueOnce({
        ...checkoutPreview,
        platformCoupons: [{ couponCode: 'SAVE50' }],
      })
      .mockResolvedValueOnce(checkoutPreview)

    await renderCheckout()

    const couponInput = await screen.findByPlaceholderText(
      i18n.global.t('checkout.selectOrEnterCode'),
    )
    await fireEvent.update(couponInput, 'SAVE50')
    await fireEvent.keyUp(couponInput, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      expect(cartService.applyPlatformCoupon).toHaveBeenCalledWith('SAVE50')
    })

    await fireEvent.click(await screen.findByRole('button', { name: 'SAVE50' }))

    await waitFor(() => {
      expect(cartService.removePlatformCoupon).toHaveBeenCalledWith('SAVE50')
    })
  })

  it('should skip applying a platform coupon when the input is blank', async () => {
    await renderCheckout()

    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('storefront.cart.applyCoupon'),
    }))

    expect(cartService.applyPlatformCoupon).not.toHaveBeenCalled()
  })

  it('should notify invalidated coupons returned during the initial preview load', async () => {
    jest.mocked(checkoutService.getPreview).mockResolvedValue({
      ...checkoutPreview,
      invalidatedCoupons: [
        {
          couponCode: 'EXPIRED',
          ownerType: 'Platform',
          reasonCode: 'expired',
          message: 'Coupon expired',
        },
      ],
    })

    await renderCheckout()

    await waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalledWith(
        i18n.global.t('checkout.couponUnavailableTitle'),
        'EXPIRED: Coupon expired',
      )
    })
  })

  it('should store the pending order and redirect when checkout returns a payment URL', async () => {
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: 'http://localhost/' },
    })
    jest.mocked(checkoutService.initiateCheckout).mockResolvedValue({
      orderIds: ['order-redirect'],
      status: 'Created',
      grandTotal: 200_000,
      paymentUrl: 'https://payments.example.test/session',
      paymentExpiresAt: null,
    })

    await renderCheckout()
    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('checkout.placeOrder'),
    }))

    await waitFor(() => {
      expect(sessionStorage.getItem('hivespace_pending_order')).toContain('order-redirect')
      expect(window.location.href).toBe('https://payments.example.test/session')
    })

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('should notify checkout failure and refresh the preview when submission fails', async () => {
    jest.mocked(checkoutService.initiateCheckout).mockRejectedValueOnce(new Error('gateway down'))
    jest.mocked(checkoutService.getPreview)
      .mockResolvedValueOnce(checkoutPreview)
      .mockResolvedValueOnce({
        ...checkoutPreview,
        invalidatedCoupons: [
          {
            couponCode: 'STALE',
            ownerType: 'Platform',
            reasonCode: 'expired',
            message: 'Coupon expired',
          },
        ],
      })

    await renderCheckout()
    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('checkout.placeOrder'),
    }))

    await waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalledWith(
        i18n.global.t('checkout.orderFailedTitle'),
        i18n.global.t('checkout.orderFailedMessage'),
      )
      expect(mockNotifyError).toHaveBeenCalledWith(
        i18n.global.t('checkout.couponUnavailableTitle'),
        'STALE: Coupon expired',
      )
    })
  })
})

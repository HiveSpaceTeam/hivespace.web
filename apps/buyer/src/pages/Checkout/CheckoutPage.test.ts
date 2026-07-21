import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import CheckoutPage from './CheckoutPage.vue'
import { addressService } from '@/services/address.service'
import { cartService } from '@/services/cart.service'
import { checkoutService } from '@/services/checkout.service'
import { paymentService } from '@/services/payment.service'
import { PaymentMethod, type CheckoutPreview, type UserAddress } from '@/types'

const mockNotifyError = jest.fn()
const mockNotifySuccess = jest.fn()
const mockOpenModal = jest.fn()
const formatMoneyMock = jest.fn()

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
            <span v-if="option.icon">{{ option.icon }}</span>
            {{ option.label }}
            <span v-if="option.subLabel">{{ option.subLabel }}</span>
            <span v-if="option.tag">{{ option.tag }}</span>
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
    useMoneyFormatter: () => ({
      formatMoney: formatMoneyMock,
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

jest.mock('@/services/payment.service', () => ({
  paymentService: {
    getPaymentMethods: jest.fn(),
    createPaymentAttempt: jest.fn(),
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
      currencyCode: 'VND',
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
          currencyCode: 'VND',
          quantity: 2,
          lineTotal: 200_000,
        },
      ],
    },
  ],
  originalSubtotal: 200_000,
  subtotal: 200_000,
  currency: 'VND',
  currencyCode: 'VND',
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
    formatMoneyMock.mockReset()
    formatMoneyMock.mockImplementation((value: unknown) => {
      const { amount } = value as {
        amount: number | null
      }

      return `${amount?.toLocaleString('vi-VN') ?? '0'}₫`
    })
    jest.mocked(checkoutService.getPreview).mockResolvedValue(checkoutPreview)
    jest.mocked(checkoutService.initiateCheckout).mockResolvedValue({
      orderIds: ['order-001'],
      status: 'Created',
      grandTotal: 200_000,
      paymentId: 'payment-001',
      paymentReferenceNo: 'PAY-01JZXYZABCDEABCDEABCDEABC',
      paymentUrl: null,
      paymentExpiresAt: null,
    })
    jest.mocked(paymentService.getPaymentMethods).mockResolvedValue({
      methods: [
        {
          code: 'COD',
          displayName: 'Cash on delivery',
          kind: 'Offline',
          gatewayCode: null,
          isEnabled: true,
          isCheckoutSelectable: true,
          availability: 'Available',
          sortOrder: 10,
        },
        {
          code: 'VNPAY',
          displayName: 'VNPay',
          kind: 'Online',
          gatewayCode: 'VNPAY',
          isEnabled: true,
          isCheckoutSelectable: true,
          availability: 'Available',
          sortOrder: 20,
        },
        {
          code: 'MOMO',
          displayName: 'MoMo',
          kind: 'Online',
          gatewayCode: 'MOMO',
          isEnabled: true,
          isCheckoutSelectable: true,
          availability: 'Available',
          sortOrder: 25,
        },
        {
          code: 'STRIPE',
          displayName: 'Stripe',
          kind: 'Online',
          gatewayCode: 'STRIPE',
          isEnabled: false,
          isCheckoutSelectable: false,
          availability: 'Future',
          sortOrder: 30,
        },
      ],
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
        paymentMethodCode: PaymentMethod.COD,
      })
    })
  })

  it('should not submit checkout when no backend-selectable payment method is available', async () => {
    jest.mocked(paymentService.getPaymentMethods).mockResolvedValue({
      methods: [
        {
          code: 'STRIPE',
          displayName: 'Stripe',
          kind: 'Online',
          gatewayCode: 'STRIPE',
          isEnabled: false,
          isCheckoutSelectable: false,
          availability: 'Future',
          sortOrder: 30,
        },
      ],
    })
    await renderCheckout()

    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('checkout.placeOrder'),
    }))

    expect(checkoutService.initiateCheckout).not.toHaveBeenCalled()
    expect(mockNotifyError).toHaveBeenCalledWith(
      i18n.global.t('checkout.orderFailedTitle'),
      i18n.global.t('checkout.paymentMethodRequired'),
    )
  })

  it('should submit checkout with the selected non-default payment method', async () => {
    await renderCheckout()

    await fireEvent.click(await screen.findByRole('button', {
      name: new RegExp(i18n.global.t('payment.methods.vnpay')),
    }))
    await fireEvent.click(screen.getByRole('button', {
      name: i18n.global.t('checkout.placeOrder'),
    }))

    await waitFor(() => {
      expect(checkoutService.initiateCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethodCode: PaymentMethod.VNPAY,
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

  it('should store the pending payment and redirect when checkout returns a payment URL', async () => {
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: 'http://localhost/' },
    })
    jest.mocked(checkoutService.initiateCheckout).mockResolvedValue({
      orderIds: ['order-redirect'],
      status: 'Created',
      grandTotal: 200_000,
      paymentId: 'payment-redirect',
      paymentReferenceNo: 'PAY-01JZXYZABCDEABCDEABCDEABC',
      latestAttempt: {
        id: 'attempt-001',
        attemptNo: 1,
        methodCode: 'VNPAY',
        gatewayCode: 'VNPAY',
        status: 'Processing',
        redirectUrl: 'https://payments.example.test/session',
        createdAt: '2026-07-11T10:00:00Z',
      },
      paymentExpiresAt: null,
    })

    await renderCheckout()
    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('checkout.placeOrder'),
    }))

    await waitFor(() => {
      expect(sessionStorage.getItem('hivespace_pending_payment')).toContain(
        'PAY-01JZXYZABCDEABCDEABCDEABC',
      )
      expect(window.location.href).toBe('https://payments.example.test/session')
    })

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('should render backend-selectable checkout methods without future Stripe', async () => {
    await renderCheckout()

    expect(await screen.findByRole('button', {
      name: new RegExp(i18n.global.t('payment.methods.cod')),
    })).toBeTruthy()
    expect(screen.getByRole('button', {
      name: new RegExp(i18n.global.t('payment.methods.vnpay')),
    })).toBeTruthy()
    expect(screen.getByRole('button', { name: /MoMo/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: i18n.global.t('payment.methods.stripe') })).toBeNull()
  })

  it('should retry a failed VNPay attempt under the same payment reference', async () => {
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: 'http://localhost/' },
    })
    jest.mocked(checkoutService.initiateCheckout).mockResolvedValue({
      orderIds: ['order-retry'],
      status: 'PaymentFailed',
      grandTotal: 200_000,
      paymentId: 'payment-retry',
      paymentReferenceNo: 'PAY-01JZXYZABCDEABCDEABCDEABC',
      latestAttempt: {
        id: 'attempt-failed',
        attemptNo: 1,
        methodCode: 'VNPAY',
        gatewayCode: 'VNPAY',
        status: 'Failed',
        createdAt: '2026-07-11T10:00:00Z',
      },
      paymentUrl: null,
      paymentExpiresAt: null,
    })
    jest.mocked(paymentService.createPaymentAttempt).mockResolvedValue({
      paymentId: 'payment-retry',
      referenceNo: 'PAY-01JZXYZABCDEABCDEABCDEABC',
      attempt: {
        id: 'attempt-retry',
        attemptNo: 2,
        methodCode: 'VNPAY',
        gatewayCode: 'VNPAY',
        status: 'Processing',
        redirectUrl: 'https://payments.example.test/retry',
        createdAt: '2026-07-11T10:05:00Z',
      },
    })

    await renderCheckout()
    await fireEvent.click(await screen.findByRole('button', {
      name: new RegExp(i18n.global.t('payment.methods.vnpay')),
    }))
    await fireEvent.click(screen.getByRole('button', {
      name: i18n.global.t('checkout.placeOrder'),
    }))
    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('payment.retryPayment'),
    }))

    await waitFor(() => {
      expect(paymentService.createPaymentAttempt).toHaveBeenCalledWith(
        'payment-retry',
        expect.objectContaining({ methodCode: 'VNPAY' }),
      )
      expect(sessionStorage.getItem('hivespace_pending_payment')).toContain(
        'PAY-01JZXYZABCDEABCDEABCDEABC',
      )
      expect(window.location.href).toBe('https://payments.example.test/retry')
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

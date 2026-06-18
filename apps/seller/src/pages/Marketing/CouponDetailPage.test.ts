import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createTestingPinia } from '@pinia/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { CouponScope, DiscountType } from '@hivespace/shared'
import i18n from '@/i18n'
import CouponDetailPage from './CouponDetailPage.vue'
import { CouponStatus } from '@/types'
import type { CouponDto } from '@/types'

const mockNotifySuccess = jest.fn()
const mockNotifyError = jest.fn()
const mockNotifyInfo = jest.fn()
const mockHandleFieldValidationErrors = jest.fn()
const mockClearFieldErrors = jest.fn()
const mockOpenModal = jest.fn()
const mockValidateAllFields = jest.fn()

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')

  return {
    ...actual,
    AppShell: { template: '<div><slot /></div>' },
    ComponentCard: { template: '<section><slot /></section>' },
    Input: {
      inheritAttrs: false,
      props: ['modelValue', 'disabled', 'prefix', 'error', 'inputClass'],
      emits: ['update:modelValue', 'input', 'blur', 'focus'],
      template: `
        <input
          data-testid="text-input"
          :value="modelValue"
          :disabled="disabled"
          @input="$emit('update:modelValue', $event.target.value); $emit('input', $event)"
          @blur="$emit('blur', $event)"
          @focus="$emit('focus', $event)"
        />
      `,
    },
    Select: {
      inheritAttrs: false,
      props: ['modelValue', 'disabled', 'options'],
      emits: ['update:modelValue'],
      template: `
        <select
          data-testid="select-input"
          :value="modelValue"
          :disabled="disabled"
          @change="$emit('update:modelValue', $event.target.value)"
        >
          <option :value="modelValue">{{ modelValue }}</option>
        </select>
      `,
    },
    Checkbox: {
      inheritAttrs: false,
      props: ['modelValue', 'disabled', 'label'],
      emits: ['update:modelValue'],
      template: `
        <label>
          <input
            data-testid="checkbox-input"
            type="checkbox"
            :checked="modelValue"
            :disabled="disabled"
            @change="$emit('update:modelValue', $event.target.checked)"
          />
          {{ label }}
        </label>
      `,
    },
    RadioGroup: { props: ['modelValue', 'options', 'disabled'], template: '<div data-testid="radio-group" />' },
    Button: {
      props: ['disabled'],
      emits: ['click'],
      template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    },
    Pagination: { template: '<div data-testid="pagination" />' },
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifySuccess: mockNotifySuccess,
      notifyError: mockNotifyError,
      notifyInfo: mockNotifyInfo,
    }),
    useFieldValidation: () => ({
      handleFieldValidationErrors: mockHandleFieldValidationErrors,
      clearFieldErrors: mockClearFieldErrors,
    }),
    useModal: () => ({ openModal: mockOpenModal }),
  }
})

jest.mock('@/components/marketing/SelectProductsModal.vue', () => ({
  __esModule: true,
  default: { name: 'SelectProductsModal', template: '<div />' },
}))

jest.mock('@/composables/useCouponValidation', () => ({
  useCouponValidation: () => ({
    validateName: jest.fn(),
    validateCode: jest.fn(),
    validateStartDateTime: jest.fn(),
    validateEndDateTime: jest.fn(),
    validateEarlySaveDateTime: jest.fn(),
    validateDiscountAmount: jest.fn(),
    validateMaxDiscountAmount: jest.fn(),
    validateMinOrderAmount: jest.fn(),
    validateMaxUsageCount: jest.fn(),
    validateMaxUsagePerUser: jest.fn(),
    validateAllFields: mockValidateAllFields,
  }),
}))

const makeCouponDto = (status: CouponStatus, overrides: Partial<CouponDto> = {}): CouponDto => ({
  id: 'coupon-001',
  code: 'SHOP1',
  name: 'Launch Coupon',
  startDateTime: '2026-07-01T00:00:00Z',
  endDateTime: '2026-07-10T00:00:00Z',
  earlySaveDateTime: null,
  discountType: DiscountType.FixedAmount,
  discountAmount: 25_000,
  discountCurrency: 'VND',
  discountPercentage: null,
  maxDiscountAmount: null,
  minOrderAmount: 100_000,
  scope: CouponScope.ItemPrice,
  maxUsageCount: 25,
  currentUsageCount: 0,
  maxUsagePerUser: 2,
  isHidden: false,
  ownerType: 0,
  createdBy: 'seller-001',
  isActive: status !== CouponStatus.Expired,
  status,
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: null,
  applicableProductIds: [],
  storeId: 'store-001',
  applicableCategoryIds: [],
  ...overrides,
})

const mockProduct = {
  id: 101,
  name: 'Mock Product',
  thumbnailUrl: null,
  skus: [],
}

const renderCouponDetail = async (
  url = '/marketing/coupons/create',
  options?: {
    fetchCouponByIdResult?: CouponDto
    fetchCouponByIdError?: Error
  },
) => {
  const pinia = createTestingPinia({
    createSpy: jest.fn,
    initialState: {
      coupon: { currentCoupon: null, coupons: [], isFetching: false },
      product: {
        products: [],
        isFetchingProducts: false,
        pagination: null,
      },
    },
  })

  const { useCouponStore } = await import('@/stores/coupon.store')
  const { useProductStore } = await import('@/stores/product.store')
  const couponStore = useCouponStore(pinia)
  const productStore = useProductStore(pinia)

  jest.mocked(couponStore.createCoupon).mockResolvedValue(makeCouponDto(CouponStatus.Upcoming))
  jest.mocked(couponStore.updateCoupon).mockResolvedValue(makeCouponDto(CouponStatus.Upcoming))
  if (options?.fetchCouponByIdError) {
    jest.mocked(couponStore.fetchCouponById).mockRejectedValue(options.fetchCouponByIdError)
  } else {
    jest
      .mocked(couponStore.fetchCouponById)
      .mockResolvedValue(options?.fetchCouponByIdResult ?? makeCouponDto(CouponStatus.Upcoming))
  }
  jest
    .mocked(productStore.fetchProducts)
    .mockResolvedValue({ products: [], pagination: null } as never)
  jest.mocked(productStore.fetchProductById).mockResolvedValue(mockProduct as never)

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/marketing/coupons', component: { template: '<div>coupon-list</div>' } },
      { path: '/marketing/coupons/create', component: CouponDetailPage },
      { path: '/marketing/coupons/detail/:id', component: CouponDetailPage },
    ],
  })
  await router.push(url)
  await router.isReady()

  render(CouponDetailPage, {
    global: {
      plugins: [pinia, router, i18n],
      stubs: {
        teleport: true,
        DateTimePicker: {
          props: ['modelValue', 'disabled'],
          emits: ['update:modelValue'],
          template: `
            <input
              data-testid="datetime-picker"
              :value="modelValue"
              :disabled="disabled"
              @input="$emit('update:modelValue', $event.target.value)"
            />
          `,
        },
        BigPlusIcon: true,
        BoxIcon: true,
        CheckIcon: true,
      },
    },
  })

  return { couponStore, router }
}

describe('CouponDetailPage (seller)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockOpenModal.mockImplementation(async () => null)
    mockValidateAllFields.mockReturnValue(true)
    mockHandleFieldValidationErrors.mockReturnValue(false)
  })

  it('renders create mode title and does not fetch a coupon by id', async () => {
    const { couponStore } = await renderCouponDetail('/marketing/coupons/create')

    expect(await screen.findByText(i18n.global.t('coupon.detail.titleCreate'))).toBeTruthy()
    expect(couponStore.fetchCouponById).not.toHaveBeenCalled()
  })

  it('renders edit mode title and loads the coupon by id', async () => {
    const { couponStore } = await renderCouponDetail('/marketing/coupons/detail/coupon-001')

    expect(await screen.findByText(i18n.global.t('coupon.detail.titleEdit'))).toBeTruthy()
    expect(couponStore.fetchCouponById).toHaveBeenCalledWith('coupon-001')
  })

  it('redirects and notifies when loading the coupon fails', async () => {
    const { router } = await renderCouponDetail('/marketing/coupons/detail/coupon-001', {
      fetchCouponByIdError: new Error('load failed'),
    })

    await waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalledWith(
        i18n.global.t('coupon.detail.notifications.loadError.title', 'Error'),
        i18n.global.t('coupon.detail.notifications.loadError.message', 'Failed to load coupon details.'),
      )
    })
    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/marketing/coupons')
    })
  })

  it('renders the expired coupon read-only footer', async () => {
    await renderCouponDetail('/marketing/coupons/detail/coupon-001', {
      fetchCouponByIdResult: makeCouponDto(CouponStatus.Expired),
    })

    expect(await screen.findByRole('button', { name: i18n.global.t('coupon.detail.actions.backToList') }))
      .toBeTruthy()
    expect(screen.queryByRole('button', { name: i18n.global.t('coupon.detail.actions.confirm') }))
      .toBeNull()
  })

  it('locks the expected fields for ongoing coupons', async () => {
    await renderCouponDetail('/marketing/coupons/detail/coupon-001', {
      fetchCouponByIdResult: makeCouponDto(CouponStatus.Ongoing),
    })

    await screen.findByText(i18n.global.t('coupon.detail.titleEdit'))

    const datePickers = screen.getAllByTestId('datetime-picker')
    const selects = screen.getAllByTestId('select-input')

    expect((datePickers[0] as HTMLInputElement).disabled).toBe(true)
    expect((datePickers[1] as HTMLInputElement).disabled).toBe(false)
    expect((selects[0] as HTMLSelectElement).disabled).toBe(true)
    expect((selects[1] as HTMLSelectElement).disabled).toBe(true)
    expect(screen.getByRole('button', { name: i18n.global.t('coupon.detail.actions.confirm') }))
      .toBeTruthy()
  })

  it('keeps duplicate mode on the create title even though it loads the source coupon', async () => {
    const { couponStore } = await renderCouponDetail('/marketing/coupons/create?copyId=coupon-001', {
      fetchCouponByIdResult: makeCouponDto(CouponStatus.Expired),
    })

    expect(await screen.findByText(i18n.global.t('coupon.detail.titleCreate'))).toBeTruthy()
    expect(couponStore.fetchCouponById).toHaveBeenCalledWith('coupon-001')
    expect(screen.getByRole('button', { name: i18n.global.t('coupon.detail.actions.confirm') }))
      .toBeTruthy()
  })

  it('returns early when validateAllFields fails', async () => {
    mockValidateAllFields.mockReturnValue(false)
    const { couponStore } = await renderCouponDetail('/marketing/coupons/create')

    await fireEvent.click(
      await screen.findByRole('button', { name: i18n.global.t('coupon.detail.actions.confirm') }),
    )

    expect(mockClearFieldErrors).toHaveBeenCalled()
    expect(couponStore.createCoupon).not.toHaveBeenCalled()
    expect(couponStore.updateCoupon).not.toHaveBeenCalled()
  })

  it('builds the create payload with isHidden and maxUsagePerUser', async () => {
    const { couponStore, router } = await renderCouponDetail('/marketing/coupons/create?type=3')

    await fireEvent.click(
      await screen.findByRole('button', { name: i18n.global.t('coupon.detail.actions.confirm') }),
    )

    await waitFor(() => {
      expect(couponStore.createCoupon).toHaveBeenCalled()
    })

    const payload = jest.mocked(couponStore.createCoupon).mock.calls[0][0]
    expect(payload).toMatchObject({
      isHidden: true,
      maxUsagePerUser: 1,
      applicableCategoryIds: [],
    })
    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/marketing/coupons')
    })
  })

  it('builds the update payload without create-only fields', async () => {
    const { couponStore } = await renderCouponDetail('/marketing/coupons/detail/coupon-001', {
      fetchCouponByIdResult: makeCouponDto(CouponStatus.Upcoming, {
        code: 'SHOPX',
        applicableProductIds: [101],
      }),
    })

    await fireEvent.click(
      await screen.findByRole('button', { name: i18n.global.t('coupon.detail.actions.confirm') }),
    )

    await waitFor(() => {
      expect(couponStore.updateCoupon).toHaveBeenCalled()
    })

    const payload = jest.mocked(couponStore.updateCoupon).mock.calls[0][0]
    expect(payload).toMatchObject({
      id: 'coupon-001',
      code: 'SHOPX',
      applicableProductIds: [101],
    })
    expect(payload).not.toHaveProperty('isHidden')
    expect(payload).not.toHaveProperty('maxUsagePerUser')
    expect(payload).not.toHaveProperty('scope')
  })

  it('suppresses generic error toast when structured field errors are handled', async () => {
    const { couponStore } = await renderCouponDetail('/marketing/coupons/create')
    jest.mocked(couponStore.createCoupon).mockRejectedValue({ errors: { code: ['duplicate'] } })
    mockHandleFieldValidationErrors.mockReturnValue(true)

    await fireEvent.click(
      await screen.findByRole('button', { name: i18n.global.t('coupon.detail.actions.confirm') }),
    )

    await waitFor(() => {
      expect(couponStore.createCoupon).toHaveBeenCalled()
    })
    expect(mockHandleFieldValidationErrors).toHaveBeenCalled()
    expect(mockNotifyError).not.toHaveBeenCalled()
  })

  it('shows the generic create error toast when field errors are not mapped', async () => {
    const { couponStore } = await renderCouponDetail('/marketing/coupons/create')
    jest.mocked(couponStore.createCoupon).mockRejectedValue(new Error('boom'))

    await fireEvent.click(
      await screen.findByRole('button', { name: i18n.global.t('coupon.detail.actions.confirm') }),
    )

    await waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalledWith(
        i18n.global.t('coupon.detail.notifications.createError.title'),
        i18n.global.t('coupon.detail.notifications.createError.message'),
      )
    })
  })
})

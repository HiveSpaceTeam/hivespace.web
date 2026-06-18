import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createTestingPinia } from '@pinia/testing'
import { render, screen, within } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import CouponListPage from './CouponListPage.vue'
import { useCouponStore } from '@/stores/coupon.store'
import { CouponStatus, DiscountType } from '@/types'
import type { CouponSummaryDto } from '@/types'

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')

  return {
    ...actual,
    AppShell: { template: '<div><slot /></div>' },
    PageBreadcrumb: { template: '<div data-testid="breadcrumb" />' },
    ComponentCard: { template: '<section><slot /></section>' },
    Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
    Input: { template: '<input />' },
    Tabs: { template: '<div data-testid="tabs" />' },
    Badge: { template: '<span><slot /></span>' },
    DropdownMenu: { template: '<div><slot name="icon" /><slot name="menu" /></div>' },
    Pagination: { template: '<div data-testid="pagination" />' },
    Spinner: { template: '<div data-testid="spinner" />' },
    useAppStore: () => ({ isLoading: false }),
    useFormatDate: () => ({ formatDateTime: (value: string) => value }),
    useConfirmModal: () => ({
      confirm: async () => false,
      deleteConfirm: async () => false,
    }),
  }
})

const ongoingCoupon: CouponSummaryDto = {
  id: 'coupon-001',
  code: 'SUMMER',
  name: 'Summer Discount',
  startDateTime: '2026-01-01T00:00:00Z',
  endDateTime: '2026-12-31T23:59:59Z',
  discountType: DiscountType.Percentage,
  discountAmount: null,
  discountCurrency: 'VND',
  discountPercentage: 15,
  maxDiscountAmount: 40_000,
  minOrderAmount: 50_000,
  maxUsageCount: 100,
  currentUsageCount: 5,
  isHidden: false,
  isActive: true,
  status: CouponStatus.Ongoing,
  applicableProductIds: [],
}

const upcomingSpecificCoupon: CouponSummaryDto = {
  ...ongoingCoupon,
  id: 'coupon-002',
  code: 'BEANS',
  name: 'Bean Bundle',
  discountType: DiscountType.FixedAmount,
  discountAmount: 25_000,
  discountPercentage: null,
  maxDiscountAmount: null,
  minOrderAmount: 0,
  status: CouponStatus.Upcoming,
  applicableProductIds: [1, 2],
}

const expiredPrivateCoupon: CouponSummaryDto = {
  ...ongoingCoupon,
  id: 'coupon-003',
  code: 'VIP99',
  name: 'VIP Private',
  status: CouponStatus.Expired,
  isHidden: true,
  isActive: false,
  applicableProductIds: [],
}

const renderCouponList = async (
  coupons: CouponSummaryDto[] = [ongoingCoupon, upcomingSpecificCoupon, expiredPrivateCoupon],
) => {
  const pinia = createTestingPinia({
    createSpy: jest.fn,
    initialState: {
      coupon: {
        coupons,
        isFetching: false,
        activeTab: String(CouponStatus.All),
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalItems: coupons.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    },
  })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/marketing/coupons', name: 'Coupon Management', component: CouponListPage },
      { path: '/marketing/coupons/create', name: 'Create Coupon', component: { template: '<div />' } },
      { path: '/marketing/coupons/detail/:id', name: 'Coupon Detail', component: { template: '<div />' } },
    ],
  })
  await router.push('/marketing/coupons')
  await router.isReady()

  render(CouponListPage, {
    global: {
      plugins: [pinia, router, i18n],
      stubs: {
        teleport: true,
        BoxIcon: true,
        CloseIcon: true,
        CopyIcon: true,
        EditIcon: true,
        EyeIcon: true,
        FixedAmountIcon: true,
        GridIcon: true,
        HorizontalDots: true,
        LockIcon: true,
        PercentageIcon: true,
        TrashRedIcon: true,
      },
    },
  })

  return { pinia, router }
}

describe('CouponListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('loads coupons and renders the empty state branch', async () => {
    const { pinia } = await renderCouponList([])

    expect(await screen.findByText(i18n.global.t('coupon.list.table.emptyText'))).toBeTruthy()

    const store = useCouponStore(pinia)
    expect(store.fetchCoupons).toHaveBeenCalled()
  })

  it('renders status badges, type badges, discount formatting, and row-specific actions', async () => {
    await renderCouponList()

    const ongoingRow = screen.getByText('Summer Discount').closest('tr')
    const upcomingRow = screen.getByText('Bean Bundle').closest('tr')
    const expiredRow = screen.getByText('VIP Private').closest('tr')

    expect(ongoingRow).toBeTruthy()
    expect(upcomingRow).toBeTruthy()
    expect(expiredRow).toBeTruthy()

    expect(within(ongoingRow!).getByText(i18n.global.t('coupon.list.tabs.ongoing'))).toBeTruthy()
    expect(within(ongoingRow!).getByText(i18n.global.t('coupon.creationGateway.shopCoupon.title')))
      .toBeTruthy()
    expect(within(ongoingRow!).getByText(i18n.global.t('coupon.list.allProducts'))).toBeTruthy()
    expect(
      within(ongoingRow!).getByText(
        `${ongoingCoupon.discountPercentage}${i18n.global.t('coupon.list.discountOff')} ` +
          `(${i18n.global.t('coupon.list.discountMax')} ₫40,000)`,
      ),
    ).toBeTruthy()
    expect(
      within(ongoingRow!).getByText(`${i18n.global.t('coupon.list.minSpend')} ₫50,000`),
    ).toBeTruthy()
    expect(within(ongoingRow!).getByText(i18n.global.t('coupon.actions.end'))).toBeTruthy()
    expect(within(ongoingRow!).getByText(i18n.global.t('coupon.actions.edit'))).toBeTruthy()

    expect(within(upcomingRow!).getByText(i18n.global.t('coupon.list.tabs.upcoming'))).toBeTruthy()
    expect(within(upcomingRow!).getByText(i18n.global.t('coupon.creationGateway.productCoupon.title')))
      .toBeTruthy()
    expect(within(upcomingRow!).getByText(i18n.global.t('coupon.list.productCount', { count: 2 })))
      .toBeTruthy()
    expect(within(upcomingRow!).getByText('₫25,000')).toBeTruthy()
    expect(within(upcomingRow!).queryByText(/Min spend:/)).toBeNull()
    expect(within(upcomingRow!).getByText(i18n.global.t('coupon.actions.delete'))).toBeTruthy()

    expect(within(expiredRow!).getByText(i18n.global.t('coupon.list.tabs.expired'))).toBeTruthy()
    expect(within(expiredRow!).getByText(i18n.global.t('coupon.creationGateway.privateCoupon.title')))
      .toBeTruthy()
    expect(within(expiredRow!).getByText(i18n.global.t('coupon.actions.view'))).toBeTruthy()
  })
})

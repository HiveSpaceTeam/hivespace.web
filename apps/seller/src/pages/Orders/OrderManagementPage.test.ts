import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { defineComponent, h } from 'vue'
import { createTestingPinia } from '@pinia/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createI18n } from 'vue-i18n'
import OrderManagementPage from './OrderManagementPage.vue'
import { useOrderStore } from '@/stores/order.store'
import { OrderProcessStatus, OrderStatus } from '@/types'
import type { Order } from '@/types'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
})

jest.mock('@/i18n', () => ({
  __esModule: true,
  default: {
    global: {
      t: (key: string) => key,
    },
  },
}))

const mockConfirmModal = jest.fn<() => Promise<boolean>>()
const mockDeleteConfirmModal = jest.fn<() => Promise<boolean>>()

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  const ButtonStub = defineComponent({
    props: {
      type: { type: String, default: 'button' },
      disabled: { type: Boolean, default: false },
    },
    emits: ['click'],
    template:
      '<button :type="type" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
  })
  const TabsStub = defineComponent({
    props: {
      modelValue: { type: String, default: '' },
      options: { type: Array, default: () => [] },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      return () =>
        h(
          'div',
          {},
          (props.options as Array<{ label: string; value: string }>).map((option) =>
            h(
              'button',
              {
                type: 'button',
                onClick: () => emit('update:modelValue', option.value),
              },
              option.label,
            ),
          ),
        )
    },
  })
  const SelectStub = defineComponent({
    props: {
      modelValue: { type: String, default: '' },
      options: { type: Array, default: () => [] },
    },
    emits: ['update:modelValue'],
    template: `
      <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
        <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
    `,
  })
  const PaginationStub = defineComponent({
    emits: ['update:currentPage', 'update:pageSize'],
    template: `
      <div>
        <button type="button" @click="$emit('update:currentPage', 2)">next-page</button>
        <button type="button" @click="$emit('update:pageSize', 25)">page-size</button>
      </div>
    `,
  })
  return {
    ...actual,
    AppShell: { template: '<div><slot /></div>' },
    PageBreadcrumb: { template: '<div data-testid="breadcrumb" />' },
    Button: ButtonStub,
    Tabs: TabsStub,
    Select: SelectStub,
    Pagination: PaginationStub,
    Avatar: { template: '<div />' },
    Spinner: { template: '<div data-testid="spinner" />' },
    ArrowDownRedIcon: { template: '<span />' },
    ListIcon: { template: '<span />' },
    MailIcon: { template: '<span />' },
    useFormatDate: () => ({
      formatDateTime: (value: string) => `formatted:${value}`,
    }),
    useConfirmModal: () => ({
      confirm: mockConfirmModal,
      deleteConfirm: mockDeleteConfirmModal,
    }),
  }
})

jest.mock('@/components/orders/ProductCell.vue', () => ({
  __esModule: true,
  default: {
    props: ['item'],
    template: '<div>{{ item.productName }}</div>',
  },
}))

const baseOrder: Order = {
  id: 'order-001',
  orderCode: 'HS-001',
  buyerName: 'Buyer One',
  items: [
    {
      id: 'item-001',
      productName: 'Honey Jar',
      productImageUrl: '/product.png',
      variation: null,
      quantity: 2,
      tag: null,
    },
  ],
  totalAmount: 200_000,
  paymentMethod: 'Banking',
  status: OrderStatus.Paid,
  actionDateTime: '2026-06-13T00:00:00Z',
  createdAt: '2026-06-13T00:00:00Z',
}

const renderOrderManagement = async (orders: Order[] = [baseOrder]) => {
  const pinia = createTestingPinia({
    createSpy: jest.fn,
    initialState: {
      order: {
        orders,
        isFetching: false,
        totalOrders: orders.length,
        activeTab: OrderProcessStatus.All,
        searchField: 'orderCode',
        searchValue: '',
        page: 1,
        pageSize: 10,
      },
    },
    stubActions: true,
  })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/orders/all', name: 'Order Management', component: OrderManagementPage }],
  })
  await router.push('/orders/all')
  await router.isReady()

  render(OrderManagementPage, {
    global: {
      plugins: [pinia, router, i18n],
      stubs: { teleport: true },
    },
  })

  return { pinia }
}

describe('OrderManagementPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConfirmModal.mockResolvedValue(true)
    mockDeleteConfirmModal.mockResolvedValue(true)
  })

  it('fetches orders on mount and switches tabs through the store', async () => {
    const { pinia } = await renderOrderManagement()
    const store = useOrderStore(pinia)

    expect(store.fetchOrders).toHaveBeenCalledTimes(1)

    await fireEvent.click(screen.getByRole('button', { name: i18n.global.t('order.tabs.readyToShip') }))

    await waitFor(() => {
      expect(store.setTab).toHaveBeenCalledWith(OrderProcessStatus.ReadyToShip)
    })
  })

  it('applies and resets filters through the store actions', async () => {
    const { pinia } = await renderOrderManagement()
    const store = useOrderStore(pinia)
    jest.clearAllMocks()

    await fireEvent.change(screen.getByRole('combobox'), { target: { value: 'customerName' } })
    await fireEvent.update(screen.getByRole('textbox'), 'Buyer One')
    await fireEvent.click(screen.getByRole('button', { name: i18n.global.t('order.search.apply') }))
    await fireEvent.click(screen.getByRole('button', { name: i18n.global.t('order.search.reset') }))

    expect(store.applyFilters).toHaveBeenCalledTimes(1)
    expect(store.resetFilters).toHaveBeenCalledTimes(1)
  })

  it('updates pagination state and refetches orders', async () => {
    const { pinia } = await renderOrderManagement([
      baseOrder,
      { ...baseOrder, id: 'order-002', orderCode: 'HS-002' },
      { ...baseOrder, id: 'order-003', orderCode: 'HS-003' },
      { ...baseOrder, id: 'order-004', orderCode: 'HS-004' },
      { ...baseOrder, id: 'order-005', orderCode: 'HS-005' },
      { ...baseOrder, id: 'order-006', orderCode: 'HS-006' },
      { ...baseOrder, id: 'order-007', orderCode: 'HS-007' },
      { ...baseOrder, id: 'order-008', orderCode: 'HS-008' },
      { ...baseOrder, id: 'order-009', orderCode: 'HS-009' },
      { ...baseOrder, id: 'order-010', orderCode: 'HS-010' },
      { ...baseOrder, id: 'order-011', orderCode: 'HS-011' },
    ])
    const store = useOrderStore(pinia)
    jest.clearAllMocks()

    await fireEvent.click(screen.getByRole('button', { name: 'next-page' }))
    await fireEvent.click(screen.getByRole('button', { name: 'page-size' }))

    await waitFor(() => {
      expect(store.fetchOrders).toHaveBeenCalledTimes(2)
    })
    expect(store.page).toBe(1)
    expect(store.pageSize).toBe(25)
  })

  it('runs confirm and cancel flows through the modal helpers', async () => {
    const { pinia } = await renderOrderManagement()
    const store = useOrderStore(pinia)
    jest.clearAllMocks()

    await fireEvent.click(screen.getByRole('button', { name: i18n.global.t('order.actions.confirm') }))
    await fireEvent.click(screen.getByRole('button', { name: i18n.global.t('order.actions.cancel') }))

    await waitFor(() => {
      expect(store.confirmOrder).toHaveBeenCalledWith('order-001')
    })
    expect(store.cancelOrder).toHaveBeenCalledWith(
      'order-001',
      i18n.global.t('order.notifications.cancelConfirm.defaultReason'),
    )
  })

  it('runs the prepare goods branch for confirmed orders', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    await renderOrderManagement([{ ...baseOrder, status: OrderStatus.Confirmed }])

    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('order.actions.prepareGoods') }),
    )

    expect(consoleSpy).toHaveBeenCalledWith('Prepare goods for order:', 'order-001')
    consoleSpy.mockRestore()
  })
})

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import i18n from '@/i18n'
import ConfigurationPage from './ConfigurationPage.vue'
import { configurationService } from '@/services/configuration.service'
import { paymentService } from '@/services/payment.service'
import type { GetPlatformCurrencyConfigResponse } from '@/types'

const mockAppStore = {
  notifyError: jest.fn(),
  notifyInfo: jest.fn(),
  notifySuccess: jest.fn(),
  setLoading: jest.fn(),
}

jest.mock('@/services/configuration.service', () => ({
  configurationService: {
    getCurrencyConfig: jest.fn(),
    updateCurrencyConfig: jest.fn(),
  },
}))

jest.mock('@/services/payment.service', () => ({
  paymentService: {
    getPaymentMethods: jest.fn(),
  },
}))

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')

  return {
    ...actual,
    AppShell: { template: '<div><slot /></div>' },
    PageBreadcrumb: { template: '<div><slot /></div>', props: ['pageTitle'] },
    Tabs: { template: '<div />', props: ['modelValue', 'options', 'variant'] },
    Button: {
      template: '<button :type="type ?? \'button\'" @click="$emit(\'click\', $event)"><slot /></button>',
      props: ['type', 'variant', 'size', 'className'],
      emits: ['click'],
    },
    Input: {
      template: `
        <label>
          <span v-if="label">{{ label }}</span>
          <input
            :type="type ?? 'text'"
            :placeholder="placeholder"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
          />
          <slot name="prepend" />
        </label>
      `,
      props: ['modelValue', 'placeholder', 'label', 'type', 'inputClass', 'class'],
      emits: ['update:modelValue'],
    },
    Select: {
      template: `
        <label>
          <span v-if="label">{{ label }}</span>
          <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
            <option v-for="option in options" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
      `,
      props: ['modelValue', 'options', 'label'],
      emits: ['update:modelValue'],
    },
    ToggleSwitch: {
      template: `
        <input
          type="checkbox"
          :checked="modelValue"
          @change="$emit('update:modelValue', $event.target.checked)"
        />
      `,
      props: ['modelValue'],
      emits: ['update:modelValue'],
    },
    useAppStore: () => mockAppStore,
    PaymentIcon: { template: '<span />' },
    SettingsIcon: { template: '<span />' },
    PlugInIcon: { template: '<span />' },
    ListIcon: { template: '<span />' },
  }
})

const currencyConfigFixture: GetPlatformCurrencyConfigResponse = {
  defaultCurrencyCode: 'VND' as const,
  supportedCurrencyCodes: ['VND', 'USD', 'EUR', 'SGD'],
  updatedAtUtc: '2026-07-01T00:00:00Z',
  version: 7,
  currencies: [
    { currencyCode: 'VND' as const, isEnabled: true },
    { currencyCode: 'USD' as const, isEnabled: true },
    { currencyCode: 'EUR' as const, isEnabled: false },
    { currencyCode: 'SGD' as const, isEnabled: false },
  ],
}

const renderPage = () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  i18n.global.locale.value = 'en'

  return render(ConfigurationPage, {
    global: {
      plugins: [pinia, i18n],
    },
  })
}

describe('ConfigurationPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
    jest.mocked(configurationService.getCurrencyConfig).mockResolvedValue(currencyConfigFixture)
    jest.mocked(configurationService.updateCurrencyConfig).mockResolvedValue(currencyConfigFixture)
    jest.mocked(paymentService.getPaymentMethods).mockResolvedValue({
      methods: [
        {
          code: 'COD',
          displayName: 'Cash on Delivery',
          kind: 'Offline',
          gatewayCode: null,
          isEnabled: true,
          isCheckoutSelectable: true,
          availability: 'Available',
          sortOrder: 1,
        },
        {
          code: 'VNPAY',
          displayName: 'VNPay',
          kind: 'Online',
          gatewayCode: 'VNPAY',
          isEnabled: true,
          isCheckoutSelectable: true,
          availability: 'Available',
          sortOrder: 2,
        },
        {
          code: 'STRIPE',
          displayName: 'Stripe',
          kind: 'Online',
          gatewayCode: 'STRIPE',
          isEnabled: false,
          isCheckoutSelectable: false,
          availability: 'Future',
          sortOrder: 3,
        },
      ],
    })
  })

  it('should load persisted currency items and default', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByDisplayValue('VND')).toBeTruthy()
    })

    expect(screen.getAllByText('VND')).toHaveLength(2)
    expect(screen.getAllByText('USD')).toHaveLength(2)
    expect(screen.getByText('EUR')).toBeTruthy()
    expect(screen.getByText('SGD')).toBeTruthy()
  })

  it('should block disabling the current default until a replacement is selected', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByDisplayValue('VND')).toBeTruthy()
    })

    const toggles = screen.getAllByRole('checkbox')
    await fireEvent.click(toggles[0] as HTMLElement)

    expect(screen.getByText('Select another enabled default currency before disabling the current default.')).toBeTruthy()
    expect(screen.getByDisplayValue('VND')).toBeTruthy()
  })

  it('should submit the updated default currency and enabled rows', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByDisplayValue('VND')).toBeTruthy()
    })

    const select = screen.getByDisplayValue('VND')
    await fireEvent.update(select, 'USD')

    const toggles = screen.getAllByRole('checkbox')
    await fireEvent.click(toggles[2] as HTMLElement)

    const saveButton = screen.getByRole('button', {
      name: i18n.global.t('configuration.saveBar.save'),
    })

    await fireEvent.click(saveButton)

    await waitFor(() => {
      expect(configurationService.updateCurrencyConfig).toHaveBeenCalledWith({
        currencies: [
          { currencyCode: 'VND', isEnabled: true },
          { currencyCode: 'USD', isEnabled: true },
          { currencyCode: 'EUR', isEnabled: true },
          { currencyCode: 'SGD', isEnabled: false },
        ],
        defaultCurrencyCode: 'USD',
        version: 7,
      })
    })
  })

  it('should show the save bar for non-currency edits', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByDisplayValue('VND')).toBeTruthy()
    })

    await fireEvent.update(screen.getByLabelText('Language'), 'en')

    expect(
      screen.getByRole('button', {
        name: i18n.global.t('configuration.saveBar.save'),
      }),
    ).toBeTruthy()
  })

  it('should keep unsupported non-currency edits dirty after save is clicked', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByDisplayValue('VND')).toBeTruthy()
    })

    await fireEvent.update(screen.getByLabelText('Language'), 'en')
    await fireEvent.click(
      screen.getByRole('button', {
        name: i18n.global.t('configuration.saveBar.save'),
      }),
    )

    expect(configurationService.updateCurrencyConfig).not.toHaveBeenCalled()
    expect(mockAppStore.notifyInfo).toHaveBeenCalledWith(
      i18n.global.t('configuration.notifications.pendingSettings'),
      i18n.global.t('configuration.notifications.pendingSettingsDescription'),
    )
    expect(
      screen.getByRole('button', {
        name: i18n.global.t('configuration.saveBar.save'),
      }),
    ).toBeTruthy()
  })

  it('should render canonical PaymentService payment methods', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Cash on Delivery')).toBeTruthy()
    })

    expect(paymentService.getPaymentMethods).toHaveBeenCalled()
    expect(screen.getByText('VNPay')).toBeTruthy()
    expect(screen.getByText('Stripe')).toBeTruthy()
    expect(screen.getByText('Future')).toBeTruthy()
    expect(screen.queryByText('MoMo')).toBeNull()
    expect(screen.queryByText('ZaloPay')).toBeNull()
  })
})

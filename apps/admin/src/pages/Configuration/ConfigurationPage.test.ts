import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import i18n from '@/i18n'
import ConfigurationPage from './ConfigurationPage.vue'
import { configurationService } from '@/services/configuration.service'
import type { GetPlatformCurrencyConfigResponse } from '@/types'

jest.mock('@/services/configuration.service', () => ({
  configurationService: {
    getCurrencyConfig: jest.fn(),
    updateCurrencyConfig: jest.fn(),
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
    useAppStore: () => ({ setLoading: jest.fn(), notifyError: jest.fn(), notifySuccess: jest.fn() }),
    PaymentIcon: { template: '<span />' },
    SettingsIcon: { template: '<span />' },
    PlugInIcon: { template: '<span />' },
    ListIcon: { template: '<span />' },
  }
})

const currencyConfigFixture: GetPlatformCurrencyConfigResponse = {
  defaultCurrencyCode: 'VND' as const,
  supportedCurrencyCodes: ['VND', 'USD', 'EUR'],
  updatedAtUtc: '2026-07-01T00:00:00Z',
  version: 7,
  currencies: [
    { currencyCode: 'VND' as const, isEnabled: true },
    { currencyCode: 'USD' as const, isEnabled: true },
    { currencyCode: 'EUR' as const, isEnabled: false },
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
    jest.mocked(configurationService.getCurrencyConfig).mockResolvedValue(currencyConfigFixture)
    jest.mocked(configurationService.updateCurrencyConfig).mockResolvedValue(currencyConfigFixture)
  })

  it('should load persisted currency items and default', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByDisplayValue('VND')).toBeTruthy()
    })

    expect(screen.getAllByText('VND')).toHaveLength(2)
    expect(screen.getAllByText('USD')).toHaveLength(2)
    expect(screen.getByText('EUR')).toBeTruthy()
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
        ],
        defaultCurrencyCode: 'USD',
        version: 7,
      })
    })
  })
})

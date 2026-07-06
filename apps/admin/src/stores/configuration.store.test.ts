import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { useConfigurationStore } from './configuration.store'
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
    useAppStore: () => ({ setLoading: jest.fn(), notifyError: jest.fn(), notifySuccess: jest.fn() }),
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

describe('useConfigurationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(configurationService.getCurrencyConfig).mockResolvedValue(currencyConfigFixture)
    jest.mocked(configurationService.updateCurrencyConfig).mockResolvedValue(currencyConfigFixture)
  })

  it('should load persisted currency items and default', async () => {
    const store = useConfigurationStore()

    await store.fetchCurrencyConfig()

    expect(configurationService.getCurrencyConfig).toHaveBeenCalled()
    expect(store.editableCurrencyConfig?.defaultCurrencyCode).toBe('VND')
    expect(store.editableCurrencyConfig?.items).toEqual([
      { currencyCode: 'VND', enabled: true },
      { currencyCode: 'USD', enabled: true },
      { currencyCode: 'EUR', enabled: false },
    ])
  })

  it('should block disabling the current default until a replacement is selected', async () => {
    const store = useConfigurationStore()

    await store.fetchCurrencyConfig()

    const result = store.setCurrencyEnabled('VND', false)

    expect(result).toBe(false)
    expect(store.validationError).toBe('configuration.localization.defaultCurrencyRequired')
    expect(store.editableCurrencyConfig?.items[0]?.enabled).toBe(true)
  })

  it('should submit the typed item list with versioned config metadata', async () => {
    const store = useConfigurationStore()

    await store.fetchCurrencyConfig()
    store.setDefaultCurrency('USD')
    store.setCurrencyEnabled('EUR', true)

    await store.saveCurrencyConfig()

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

  it('should restore the last persisted configuration when changes are discarded', async () => {
    const store = useConfigurationStore()

    await store.fetchCurrencyConfig()
    store.setDefaultCurrency('USD')
    store.setCurrencyEnabled('EUR', true)

    store.discardChanges()

    expect(store.editableCurrencyConfig).toEqual({
      defaultCurrencyCode: 'VND',
      version: 7,
      items: [
        { currencyCode: 'VND', enabled: true },
        { currencyCode: 'USD', enabled: true },
        { currencyCode: 'EUR', enabled: false },
      ],
    })
    expect(store.validationError).toBeNull()
  })

  it('should only expose enabled currencies as default selector options', async () => {
    const store = useConfigurationStore()

    await store.fetchCurrencyConfig()
    store.setCurrencyEnabled('EUR', true)

    expect(store.enabledCurrencyOptions).toEqual(['VND', 'USD', 'EUR'])
  })
})

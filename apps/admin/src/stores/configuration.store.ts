import type {
  GetPlatformCurrencyConfigResponse,
  PlatformCurrencyConfigItem,
  SupportedCurrencyCode,
  UpdatePlatformCurrencyConfigRequest,
  UpdatePlatformCurrencyConfigResponse,
} from '@/types'
import type { PlatformCurrencyConfig } from '@hivespace/shared'
import { useAppStore } from '@hivespace/shared'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { configurationService } from '@/services/configuration.service'

const mapApiResponseToConfig = (
  response: GetPlatformCurrencyConfigResponse | UpdatePlatformCurrencyConfigResponse,
): PlatformCurrencyConfig => ({
  defaultCurrencyCode: response.defaultCurrencyCode,
  version: response.version,
  items: response.currencies.map((item) => ({
    currencyCode: item.currencyCode,
    enabled: item.isEnabled,
  })),
})

const mapConfigToUpdateRequest = (
  config: PlatformCurrencyConfig,
): UpdatePlatformCurrencyConfigRequest => ({
  defaultCurrencyCode: config.defaultCurrencyCode,
  version: config.version,
  currencies: config.items.map((item: PlatformCurrencyConfigItem) => ({
    currencyCode: item.currencyCode,
    isEnabled: item.enabled,
  })),
})

const cloneCurrencyConfig = (config: PlatformCurrencyConfig): PlatformCurrencyConfig => ({
  defaultCurrencyCode: config.defaultCurrencyCode,
  version: config.version,
  items: config.items.map((item: PlatformCurrencyConfigItem) => ({ ...item })),
})

const hasMatchingItems = (
  leftItems: PlatformCurrencyConfigItem[],
  rightItems: PlatformCurrencyConfigItem[],
) => {
  if (leftItems.length !== rightItems.length) {
    return false
  }

  return leftItems.every((item, index) => {
    const rightItem = rightItems[index]

    return (
      rightItem &&
      item.currencyCode === rightItem.currencyCode &&
      item.enabled === rightItem.enabled
    )
  })
}

export const useConfigurationStore = defineStore('configuration', () => {
  const currencyConfig = ref<PlatformCurrencyConfig | null>(null)
  const editableCurrencyConfig = ref<PlatformCurrencyConfig | null>(null)
  const validationError = ref<string | null>(null)

  const enabledCurrencyOptions = computed(() => {
    if (!editableCurrencyConfig.value) {
      return []
    }

    return editableCurrencyConfig.value.items
      .filter((item: PlatformCurrencyConfigItem) => item.enabled)
      .map((item: PlatformCurrencyConfigItem) => item.currencyCode)
  })

  const hasChanges = computed(() => {
    if (!currencyConfig.value || !editableCurrencyConfig.value) {
      return false
    }

    return (
      currencyConfig.value.defaultCurrencyCode !== editableCurrencyConfig.value.defaultCurrencyCode ||
      currencyConfig.value.version !== editableCurrencyConfig.value.version ||
      !hasMatchingItems(currencyConfig.value.items, editableCurrencyConfig.value.items)
    )
  })

  const changeCount = computed(() => {
    if (!currencyConfig.value || !editableCurrencyConfig.value) {
      return 0
    }

    let count = 0

    if (currencyConfig.value.defaultCurrencyCode !== editableCurrencyConfig.value.defaultCurrencyCode) {
      count += 1
    }

    editableCurrencyConfig.value.items.forEach((item: PlatformCurrencyConfigItem, index: number) => {
      if (item.enabled !== currencyConfig.value?.items[index]?.enabled) {
        count += 1
      }
    })

    return count
  })

  const clearValidationError = () => {
    validationError.value = null
  }

  const fetchCurrencyConfig = async () => {
    const appStore = useAppStore()

    try {
      appStore.setLoading(true)
      clearValidationError()

      const response = await configurationService.getCurrencyConfig()
      const config = mapApiResponseToConfig(response)

      currencyConfig.value = cloneCurrencyConfig(config)
      editableCurrencyConfig.value = cloneCurrencyConfig(config)
      return config
    } finally {
      appStore.setLoading(false)
    }
  }

  const setDefaultCurrency = (currencyCode: SupportedCurrencyCode) => {
    if (!editableCurrencyConfig.value) {
      return
    }

    const targetCurrency = editableCurrencyConfig.value.items.find(
      (item: PlatformCurrencyConfigItem) => item.currencyCode === currencyCode,
    )

    if (!targetCurrency?.enabled) {
      return
    }

    editableCurrencyConfig.value.defaultCurrencyCode = currencyCode
    clearValidationError()
  }

  const setCurrencyEnabled = (currencyCode: SupportedCurrencyCode, enabled: boolean) => {
    if (!editableCurrencyConfig.value) {
      return false
    }

    if (!enabled && editableCurrencyConfig.value.defaultCurrencyCode === currencyCode) {
      validationError.value = 'configuration.localization.defaultCurrencyRequired'
      return false
    }

    const targetCurrency = editableCurrencyConfig.value.items.find(
      (item: PlatformCurrencyConfigItem) => item.currencyCode === currencyCode,
    )

    if (!targetCurrency) {
      return false
    }

    targetCurrency.enabled = enabled
    clearValidationError()
    return true
  }

  const discardChanges = () => {
    if (!currencyConfig.value) {
      return
    }

    editableCurrencyConfig.value = cloneCurrencyConfig(currencyConfig.value)
    clearValidationError()
  }

  const saveCurrencyConfig = async () => {
    const appStore = useAppStore()

    if (!editableCurrencyConfig.value) {
      return null
    }

    const payload = mapConfigToUpdateRequest(editableCurrencyConfig.value)

    try {
      appStore.setLoading(true)
      clearValidationError()

      const response = await configurationService.updateCurrencyConfig(payload)
      const config = mapApiResponseToConfig(response)
      currencyConfig.value = cloneCurrencyConfig(config)
      editableCurrencyConfig.value = cloneCurrencyConfig(config)

      return config
    } finally {
      appStore.setLoading(false)
    }
  }

  return {
    currencyConfig,
    editableCurrencyConfig,
    validationError,
    enabledCurrencyOptions,
    hasChanges,
    changeCount,
    fetchCurrencyConfig,
    setDefaultCurrency,
    setCurrencyEnabled,
    discardChanges,
    saveCurrencyConfig,
  }
})

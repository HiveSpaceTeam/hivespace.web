import type { PlatformCurrencyConfig, SupportedCurrencyCode } from '@hivespace/shared'
import { BaseService } from './base.service'

interface CurrencyPolicyApiResponse {
  currencies: Array<{
    currencyCode: SupportedCurrencyCode
    isEnabled: boolean
  }>
  defaultCurrencyCode: SupportedCurrencyCode
  version: number
}

const mapCurrencyPolicy = (response: CurrencyPolicyApiResponse): PlatformCurrencyConfig => ({
  defaultCurrencyCode: response.defaultCurrencyCode,
  version: response.version,
  items: response.currencies.map((item) => ({
    currencyCode: item.currencyCode,
    enabled: item.isEnabled,
  })),
})

class ConfigurationService extends BaseService {
  async getCurrencyConfig(): Promise<PlatformCurrencyConfig> {
    const response = await this.get<CurrencyPolicyApiResponse>('/users/platform-currency-policy')
    return mapCurrencyPolicy(response)
  }
}

export const configurationService = new ConfigurationService()

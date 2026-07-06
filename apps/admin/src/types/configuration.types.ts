import type { SupportedCurrencyCode } from '@hivespace/shared'

export type { PlatformCurrencyConfig, PlatformCurrencyConfigItem, SupportedCurrencyCode } from '@hivespace/shared'

export interface GetPlatformCurrencyConfigResponse {
  currencies: PlatformCurrencyApiItem[]
  defaultCurrencyCode: SupportedCurrencyCode
  supportedCurrencyCodes: SupportedCurrencyCode[]
  version: number
  updatedAtUtc: string | null
}

export interface PlatformCurrencyApiItem {
  currencyCode: SupportedCurrencyCode
  isEnabled: boolean
}

export interface UpdatePlatformCurrencyConfigRequest {
  defaultCurrencyCode: SupportedCurrencyCode
  currencies: PlatformCurrencyApiItem[]
  version: number
}

export interface UpdatePlatformCurrencyConfigResponse extends GetPlatformCurrencyConfigResponse {}

export type KnownCurrencyCode = 'VND' | 'USD' | 'EUR'

export type SupportedCurrencyCode = string

export type MoneyIssueCode =
  | 'missing_currency'
  | 'unsupported_currency'
  | 'invalid_amount'
  | 'invalid_money'

export interface MoneyIssue {
  code: MoneyIssueCode
  placeholder?: string
}

export interface MoneyDisplay {
  amount: number | null
  currencyCode: SupportedCurrencyCode | null
  issue?: MoneyIssue | null
}

export interface PlatformCurrencyConfigItem {
  currencyCode: SupportedCurrencyCode
  enabled: boolean
}

export interface PlatformCurrencyConfig {
  defaultCurrencyCode: SupportedCurrencyCode
  items: PlatformCurrencyConfigItem[]
  version: number
}

export type MoneyInputMode = 'display' | 'raw-smallest-unit'

export interface MoneyInputOptions {
  locale?: string
  mode?: MoneyInputMode
}

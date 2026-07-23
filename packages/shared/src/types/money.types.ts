export type KnownCurrencyCode = 'VND' | 'USD' | 'EUR'

export type CurrencyCode = string

export type CurrencyCodeInput = CurrencyCode | number | null | undefined

export type SupportedCurrencyCode = CurrencyCode

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
  currencyCode: CurrencyCode | null
  issue?: MoneyIssue | null
}

export interface PlatformCurrencyConfigItem {
  currencyCode: CurrencyCode
  enabled: boolean
}

export interface PlatformCurrencyConfig {
  defaultCurrencyCode: CurrencyCode
  items: PlatformCurrencyConfigItem[]
  version: number
}

export type MoneyInputMode = 'display' | 'raw-smallest-unit'

export interface MoneyInputOptions {
  locale?: string
  mode?: MoneyInputMode
}

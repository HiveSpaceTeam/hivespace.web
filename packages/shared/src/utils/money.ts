import type { MoneyDisplay, MoneyIssue, SupportedCurrencyCode } from '../types/money.types'

const NUMERIC_CURRENCY_CODES: Record<number, SupportedCurrencyCode> = {
  704: 'VND',
  840: 'USD',
  978: 'EUR',
}

export const normalizeCurrencyCode = (
  currencyCode: string | number | null | undefined,
  fallback?: SupportedCurrencyCode,
): SupportedCurrencyCode | null => {
  if (typeof currencyCode === 'string') {
    const normalizedCurrencyCode = currencyCode.trim().toUpperCase()

    if (!normalizedCurrencyCode) {
      return fallback ?? null
    }

    if (/^\d+$/.test(normalizedCurrencyCode)) {
      return NUMERIC_CURRENCY_CODES[Number(normalizedCurrencyCode)] ?? fallback ?? null
    }

    return normalizedCurrencyCode
  }

  if (typeof currencyCode === 'number') {
    return NUMERIC_CURRENCY_CODES[currencyCode] ?? fallback ?? null
  }

  return fallback ?? null
}

export const createMoneyDisplay = (
  amount: number | null | undefined,
  currencyCode: string | number | null | undefined,
  options?: {
    fallbackCurrencyCode?: SupportedCurrencyCode
    issue?: MoneyIssue | null
  },
): MoneyDisplay => {
  if (options?.issue) {
    return {
      amount: amount ?? null,
      currencyCode: normalizeCurrencyCode(currencyCode, options.fallbackCurrencyCode),
      issue: options.issue,
    }
  }

  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return {
      amount: null,
      currencyCode: normalizeCurrencyCode(currencyCode, options?.fallbackCurrencyCode),
      issue: { code: 'invalid_amount' },
    }
  }

  const normalizedCurrencyCode = normalizeCurrencyCode(currencyCode, options?.fallbackCurrencyCode)

  if (!normalizedCurrencyCode) {
    return {
      amount,
      currencyCode: null,
      issue: { code: 'missing_currency' },
    }
  }

  return {
    amount,
    currencyCode: normalizedCurrencyCode,
  }
}

export const createAggregateMoneyDisplay = (
  amount: number | null | undefined,
  currencies: Array<string | number | null | undefined>,
  fallback?: SupportedCurrencyCode,
): MoneyDisplay => {
  const normalizedCurrencies = Array.from(
    new Set(currencies.map((currency) => normalizeCurrencyCode(currency, fallback)).filter(Boolean)),
  ) as SupportedCurrencyCode[]

  if (normalizedCurrencies.length === 0) {
    return createMoneyDisplay(amount, null, {
      issue: { code: 'missing_currency' },
    })
  }

  if (normalizedCurrencies.length > 1) {
    return createMoneyDisplay(amount, normalizedCurrencies[0], {
      issue: { code: 'invalid_money' },
    })
  }

  return createMoneyDisplay(amount, normalizedCurrencies[0])
}

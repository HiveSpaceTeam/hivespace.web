import type {
  CurrencyCode,
  CurrencyCodeInput,
  MoneyDisplay,
  MoneyIssue,
  MoneyIssueCode,
  SupportedCurrencyCode,
} from '../types/money.types'

const NUMERIC_CURRENCY_CODES: Record<number, SupportedCurrencyCode> = {
  704: 'VND',
  840: 'USD',
  978: 'EUR',
}

export const normalizeCurrencyCode = (
  currencyCode: CurrencyCodeInput,
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
  currencyCode: CurrencyCodeInput,
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

export interface NormalizeMoneyDisplayOptions {
  currencyCode?: CurrencyCodeInput
  fallbackCurrencyCode?: SupportedCurrencyCode
  issue?: MoneyIssue | null
}

export interface MoneyReadModelLike {
  amount?: number | null
  currency?: CurrencyCodeInput
  currencyCode?: CurrencyCodeInput
  issue?: MoneyIssue | null
  isValid?: boolean
  issueCode?: MoneyIssueCode | null
  displayPlaceholder?: string | null
}

export type NormalizableMoney = MoneyDisplay | MoneyReadModelLike | number | null | undefined

const isMoneyReadModelLike = (money: NormalizableMoney): money is MoneyReadModelLike =>
  typeof money === 'object' && money !== null

const resolveMoneyIssue = (
  money: MoneyReadModelLike,
  fallbackIssue?: MoneyIssue | null,
): MoneyIssue | null => {
  if (money.issue) {
    return money.issue
  }

  if (money.isValid === false) {
    return {
      code: money.issueCode ?? 'invalid_money',
      placeholder: money.displayPlaceholder ?? undefined,
    }
  }

  return fallbackIssue ?? null
}

export const normalizeMoneyDisplay = (
  money: NormalizableMoney,
  options?: NormalizeMoneyDisplayOptions,
): MoneyDisplay => {
  if (typeof money === 'number') {
    return createMoneyDisplay(money, options?.currencyCode, {
      fallbackCurrencyCode: options?.fallbackCurrencyCode,
      issue: options?.issue,
    })
  }

  if (isMoneyReadModelLike(money)) {
    return createMoneyDisplay(
      money.amount,
      money.currencyCode ?? money.currency ?? options?.currencyCode,
      {
        fallbackCurrencyCode: options?.fallbackCurrencyCode,
        issue: resolveMoneyIssue(money, options?.issue),
      },
    )
  }

  return createMoneyDisplay(null, options?.currencyCode, {
    fallbackCurrencyCode: options?.fallbackCurrencyCode,
    issue: options?.issue,
  })
}

export const createAggregateMoneyDisplay = (
  amount: number | null | undefined,
  currencies: CurrencyCodeInput[],
  fallback?: SupportedCurrencyCode,
): MoneyDisplay => {
  const normalizedCurrencies = Array.from(
    new Set(currencies.map((currency) => normalizeCurrencyCode(currency, fallback)).filter(Boolean)),
  ) as CurrencyCode[]

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

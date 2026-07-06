import type {
  MoneyDisplay,
  MoneyInputMode,
  SupportedCurrencyCode,
} from '../types/money.types'

type TranslateFn = (key: string) => string

interface UseMoneyFormatterOptions {
  locale?: string
  t?: TranslateFn
}

interface FormatMoneyOptions extends UseMoneyFormatterOptions {
  mode?: MoneyInputMode
}

const DEFAULT_LOCALE = 'en-US'
const DEFAULT_INVALID_PLACEHOLDER = 'Invalid money'

const CURRENCY_SCALE: Record<SupportedCurrencyCode, number> = {
  VND: 1,
  USD: 100,
  EUR: 100,
}

const CURRENCY_FRACTION_DIGITS: Record<SupportedCurrencyCode, number> = {
  VND: 0,
  USD: 2,
  EUR: 2,
}

const isSupportedCurrencyCode = (
  currencyCode: string | null | undefined,
): currencyCode is SupportedCurrencyCode => {
  return currencyCode === 'VND' || currencyCode === 'USD' || currencyCode === 'EUR'
}

const getInvalidPlaceholder = (t?: TranslateFn, fallback?: string | null) => {
  return fallback ?? t?.('common.money.invalid') ?? DEFAULT_INVALID_PLACEHOLDER
}

const formatRawSmallestUnit = (
  amount: number,
  currencyCode: SupportedCurrencyCode,
  locale: string,
) => {
  const formattedAmount = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(amount)

  return `${formattedAmount} ${currencyCode}`
}

const normalizeAmount = (
  amount: number,
  currencyCode: SupportedCurrencyCode,
  mode: MoneyInputMode,
) => {
  if (mode === 'raw-smallest-unit') {
    return amount
  }

  return amount / CURRENCY_SCALE[currencyCode]
}

export const formatMoney = (
  money: MoneyDisplay,
  options?: FormatMoneyOptions,
) => {
  if (money.issue) {
    return getInvalidPlaceholder(options?.t, money.issue.placeholder)
  }

  if (!isSupportedCurrencyCode(money.currencyCode)) {
    return getInvalidPlaceholder(options?.t)
  }

  if (money.amount === null || Number.isNaN(money.amount)) {
    return getInvalidPlaceholder(options?.t)
  }

  const locale = options?.locale ?? DEFAULT_LOCALE
  const mode = options?.mode ?? 'display'

  if (mode === 'raw-smallest-unit') {
    return formatRawSmallestUnit(money.amount, money.currencyCode, locale)
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currencyCode,
    minimumFractionDigits: CURRENCY_FRACTION_DIGITS[money.currencyCode],
    maximumFractionDigits: CURRENCY_FRACTION_DIGITS[money.currencyCode],
  }).format(normalizeAmount(money.amount, money.currencyCode, mode))
}

export const useMoneyFormatter = (options?: UseMoneyFormatterOptions) => {
  return {
    formatMoney: (money: MoneyDisplay, formatOptions?: Omit<FormatMoneyOptions, 't'>) =>
      formatMoney(money, {
        ...formatOptions,
        locale: formatOptions?.locale ?? options?.locale,
        t: options?.t,
      }),
  }
}

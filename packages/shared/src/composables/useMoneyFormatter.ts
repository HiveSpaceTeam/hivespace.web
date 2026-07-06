import type {
  KnownCurrencyCode,
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

const KNOWN_CURRENCY_SCALE: Record<KnownCurrencyCode, number> = {
  VND: 1,
  USD: 100,
  EUR: 100,
}

const KNOWN_CURRENCY_FRACTION_DIGITS: Record<KnownCurrencyCode, number> = {
  VND: 0,
  USD: 2,
  EUR: 2,
}

const isKnownCurrencyCode = (
  currencyCode: string | null | undefined,
): currencyCode is KnownCurrencyCode => {
  return currencyCode === 'VND' || currencyCode === 'USD' || currencyCode === 'EUR'
}

const isSupportedCurrencyCode = (
  currencyCode: string | null | undefined,
): currencyCode is SupportedCurrencyCode => {
  return typeof currencyCode === 'string' && /^[A-Z]{3}$/.test(currencyCode)
}

const getCurrencyFractionDigits = (currencyCode: SupportedCurrencyCode): number => {
  if (isKnownCurrencyCode(currencyCode)) {
    return KNOWN_CURRENCY_FRACTION_DIGITS[currencyCode] ?? 2
  }

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency: currencyCode,
  }).resolvedOptions().maximumFractionDigits ?? 2
}

const getCurrencyScale = (currencyCode: SupportedCurrencyCode): number => {
  if (isKnownCurrencyCode(currencyCode)) {
    return KNOWN_CURRENCY_SCALE[currencyCode] ?? 100
  }

  return 10 ** getCurrencyFractionDigits(currencyCode)
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

  return amount / getCurrencyScale(currencyCode)
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

  const fractionDigits = getCurrencyFractionDigits(money.currencyCode)

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currencyCode,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
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

import { ref, watch, type Ref } from 'vue'
import type {
  MoneyInputOptions,
  SupportedCurrencyCode,
} from '../types/money.types'

const DEFAULT_LOCALE = 'en-US'

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

const normalizeInput = (value: string, currencyCode: SupportedCurrencyCode) => {
  const trimmed = value.trim()
  if (!trimmed) return ''

  if (currencyCode === 'VND') {
    return trimmed.replace(/[^\d]/g, '')
  }

  const sanitized = trimmed.replace(/[^\d.,]/g, '')
  if (!sanitized) return ''

  if (sanitized.includes('.') && sanitized.includes(',')) {
    return sanitized.replace(/,/g, '')
  }

  if (sanitized.includes(',')) {
    return sanitized.replace(',', '.')
  }

  return sanitized
}

const parseInputValue = (
  value: string,
  currencyCode: SupportedCurrencyCode,
  options?: MoneyInputOptions,
) => {
  const normalized = normalizeInput(value, currencyCode)
  if (!normalized) return null

  if (options?.mode === 'raw-smallest-unit') {
    const rawValue = Number(normalized.replace(/[^\d]/g, ''))
    return Number.isNaN(rawValue) ? null : rawValue
  }

  if (currencyCode === 'VND') {
    const parsed = Number(normalized)
    return Number.isNaN(parsed) ? null : parsed
  }

  const parsed = Number.parseFloat(normalized)
  if (Number.isNaN(parsed)) return null

  return Math.round(parsed * CURRENCY_SCALE[currencyCode])
}

const formatInputValue = (
  value: number | null | undefined,
  currencyCode: SupportedCurrencyCode,
  options?: MoneyInputOptions,
) => {
  if (value === null || value === undefined || Number.isNaN(value)) return ''

  const locale = options?.locale ?? DEFAULT_LOCALE

  if (options?.mode === 'raw-smallest-unit') {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(value)
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: CURRENCY_FRACTION_DIGITS[currencyCode],
    maximumFractionDigits: CURRENCY_FRACTION_DIGITS[currencyCode],
  }).format(value / CURRENCY_SCALE[currencyCode])
}

export const useMoneyInput = (
  modelValue: Ref<number | null>,
  currencyCode: Ref<SupportedCurrencyCode | null> | SupportedCurrencyCode,
  options?: MoneyInputOptions,
) => {
  const displayValue = ref('')
  const currencyRef = typeof currencyCode === 'string' ? ref(currencyCode) : currencyCode

  const syncDisplayValue = () => {
    if (!isSupportedCurrencyCode(currencyRef.value)) {
      displayValue.value = modelValue.value === null ? '' : String(modelValue.value)
      return
    }

    displayValue.value = formatInputValue(modelValue.value, currencyRef.value, options)
  }

  const handleInput = (event: Event) => {
    const input = event.target as HTMLInputElement

    if (!isSupportedCurrencyCode(currencyRef.value)) {
      modelValue.value = null
      displayValue.value = input.value
      return
    }

    modelValue.value = parseInputValue(input.value, currencyRef.value, options)
    displayValue.value = formatInputValue(modelValue.value, currencyRef.value, options)
    input.value = displayValue.value
  }

  watch([modelValue, currencyRef], syncDisplayValue, { immediate: true })

  return {
    displayValue,
    formatInputValue,
    handleInput,
    parseInputValue,
  }
}

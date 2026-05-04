const DEFAULT_LOCALE = 'vi-VN'
const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh'
const FALLBACK_VALUE = '-'

export interface FormatDateOptions {
  locale?: string
  timeZone?: string
}

interface RelativeTimeOptions extends FormatDateOptions {
  t?: (key: string, params?: Record<string, number>) => string
}

const getDateParts = (
  value: string,
  options?: FormatDateOptions,
): Record<'YYYY' | 'MM' | 'DD' | 'HH' | 'mm' | 'ss', string> | null => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  const formatter = new Intl.DateTimeFormat(options?.locale ?? DEFAULT_LOCALE, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: options?.timeZone ?? DEFAULT_TIME_ZONE,
  })

  const parts = formatter.formatToParts(date)
  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return {
    YYYY: lookup('year'),
    MM: lookup('month'),
    DD: lookup('day'),
    HH: lookup('hour'),
    mm: lookup('minute'),
    ss: lookup('second'),
  }
}

export const formatDate = (
  value?: string | null,
  format = 'DD/MM/YYYY',
  options?: FormatDateOptions,
): string => {
  if (!value) return FALLBACK_VALUE

  try {
    const parts = getDateParts(value, options)
    if (!parts) return FALLBACK_VALUE

    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (token) => parts[token as keyof typeof parts])
  } catch {
    return FALLBACK_VALUE
  }
}

export const formatDateTime = (
  value?: string | null,
  format = 'DD/MM/YYYY HH:mm',
  options?: FormatDateOptions,
): string => {
  return formatDate(value, format, options)
}

export const formatNow = (
  format = 'DD/MM/YYYY HH:mm',
  options?: FormatDateOptions,
): string => {
  return formatDateTime(new Date().toISOString(), format, options)
}

export const formatRelativeTime = (
  iso?: string | null,
  options?: RelativeTimeOptions,
): string => {
  if (!iso) return FALLBACK_VALUE

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return FALLBACK_VALUE

  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const translator = options?.t

  if (minutes < 1) {
    return translator ? translator('common.notifications.justNow') : 'just now'
  }

  if (minutes < 60) {
    return translator
      ? translator('common.notifications.minutesAgo', { count: minutes })
      : `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return translator
      ? translator('common.notifications.hoursAgo', { count: hours })
      : `${hours} hour${hours === 1 ? '' : 's'} ago`
  }

  return formatDate(iso, 'DD/MM/YYYY', options)
}

export function useFormatDate() {
  return {
    formatDate,
    formatDateTime,
    formatRelativeTime,
    formatNow,
  }
}

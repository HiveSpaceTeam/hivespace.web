export interface PasswordComplexityOptions {
  minLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireNumber?: boolean
  requireSpecial?: boolean
}

export const validateRequired = (
  value: string | number | boolean | null | undefined,
  message: string,
): string => {
  if (typeof value === 'string') {
    return value.trim() ? '' : message
  }

  return value === null || value === undefined ? message : ''
}

export const validateEmail = (value: string, message: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value.trim()) ? '' : message
}

export const validateMinLength = (value: string, min: number, message: string): string => {
  return value.length >= min ? '' : message
}

export const validatePasswordComplexity = (
  value: string,
  options: PasswordComplexityOptions,
  message: string,
): string => {
  const {
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecial = false,
  } = options

  if (requireUppercase && !/[A-Z]/.test(value)) return message
  if (requireLowercase && !/[a-z]/.test(value)) return message
  if (requireNumber && !/[0-9]/.test(value)) return message
  if (requireSpecial && !/[^A-Za-z0-9]/.test(value)) return message

  return ''
}

export const validateMatches = (
  value: string,
  expected: string,
  message: string,
): string => {
  return value === expected ? '' : message
}

export const validatePositiveNumber = (
  value: number | string | null | undefined,
  message: string,
): string => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? '' : message
}

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { ValidationErrors } from './useFieldValidation'

jest.mock('vue-i18n', () => ({
  useI18n: jest.fn(() => ({
    t: jest.fn((key: string) => key),
  })),
}))

describe('useFieldValidation', () => {
  let errors: ValidationErrors

  beforeEach(() => {
    errors = { common: [], username: '', email: '' }
  })

  it('should reset all errors when clearing field errors', async () => {
    const { useFieldValidation } = await import('./useFieldValidation')
    const { clearFieldErrors } = useFieldValidation()
    errors.common = ['Some error']
    errors.username = 'Bad username'

    clearFieldErrors(errors)

    expect(errors.common).toEqual([])
    expect(errors.username).toBe('')
  })

  it('should add to common errors when no source is specified', async () => {
    const { useFieldValidation } = await import('./useFieldValidation')
    const { handleFieldValidationErrors } = useFieldValidation()

    const hasErrors = handleFieldValidationErrors(
      { errors: [{ code: 'USER_NOT_FOUND', messageCode: 'USER_NOT_FOUND', source: '' }], status: '', timestamp: '', traceId: '', version: '' },
      errors,
    )

    expect(hasErrors).toBe(true)
    expect(errors.common).toHaveLength(1)
  })

  it('should map error to field when source is specified', async () => {
    const { useFieldValidation } = await import('./useFieldValidation')
    const { handleFieldValidationErrors } = useFieldValidation()

    const hasErrors = handleFieldValidationErrors(
      { errors: [{ code: 'INVALID_EMAIL', messageCode: 'INVALID_EMAIL', source: 'email' }], status: '', timestamp: '', traceId: '', version: '' },
      errors,
    )

    expect(hasErrors).toBe(true)
    expect(typeof errors.email).toBe('string')
    expect(errors.email).not.toBe('')
  })

  it('should add to common errors when source is unknown', async () => {
    const { useFieldValidation } = await import('./useFieldValidation')
    const { handleFieldValidationErrors } = useFieldValidation()

    const hasErrors = handleFieldValidationErrors(
      { errors: [{ code: 'ERR', messageCode: 'ERR', source: 'unknownField' }], status: '', timestamp: '', traceId: '', version: '' },
      errors,
    )

    expect(hasErrors).toBe(true)
    expect(errors.common).toHaveLength(1)
  })

  it('should return false when errors array is empty', async () => {
    const { useFieldValidation } = await import('./useFieldValidation')
    const { handleFieldValidationErrors } = useFieldValidation()

    const hasErrors = handleFieldValidationErrors({ errors: [], status: '', timestamp: '', traceId: '', version: '' }, errors)

    expect(hasErrors).toBe(false)
  })
})

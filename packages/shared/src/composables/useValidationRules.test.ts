import { describe, expect, it } from '@jest/globals'
import {
  validateEmail,
  validateMatches,
  validateMinLength,
  validatePasswordComplexity,
  validatePositiveNumber,
  validateRequired,
} from './useValidationRules'

describe('validateRequired', () => {
  it('should return message for empty string', () => {
    expect(validateRequired('', 'Required')).toBe('Required')
  })

  it('should return empty string for non-empty value', () => {
    expect(validateRequired('hello', 'Required')).toBe('')
  })

  it('should return message for null value', () => {
    expect(validateRequired(null, 'Required')).toBe('Required')
  })

  it('should return message for undefined value', () => {
    expect(validateRequired(undefined, 'Required')).toBe('Required')
  })

  it('should return empty string for boolean false', () => {
    expect(validateRequired(false, 'Required')).toBe('')
  })

  it('should return empty string for number zero', () => {
    expect(validateRequired(0, 'Required')).toBe('')
  })
})

describe('validateEmail', () => {
  it('should return empty string for valid email', () => {
    expect(validateEmail('user@example.com', 'Invalid')).toBe('')
  })

  it('should return message for invalid email', () => {
    expect(validateEmail('not-an-email', 'Invalid')).toBe('Invalid')
  })

  it('should return message for email without domain', () => {
    expect(validateEmail('user@', 'Invalid')).toBe('Invalid')
  })
})

describe('validateMinLength', () => {
  it('should return empty string when above minimum length', () => {
    expect(validateMinLength('hello world', 5, 'Too short')).toBe('')
  })

  it('should return message when below minimum length', () => {
    expect(validateMinLength('hi', 5, 'Too short')).toBe('Too short')
  })

  it('should return empty string at exact minimum length', () => {
    expect(validateMinLength('hello', 5, 'Too short')).toBe('')
  })
})

describe('validatePasswordComplexity', () => {
  it('should return message when uppercase required but not present', () => {
    expect(validatePasswordComplexity('lowercase', { requireUppercase: true }, 'Weak')).toBe('Weak')
  })

  it('should return empty string when uppercase requirement is met', () => {
    expect(validatePasswordComplexity('Password', { requireUppercase: true }, 'Weak')).toBe('')
  })

  it('should return message when number required but not present', () => {
    expect(validatePasswordComplexity('Password', { requireNumber: true }, 'Weak')).toBe('Weak')
  })

  it('should return empty string when all requirements are met', () => {
    expect(
      validatePasswordComplexity('Password1!', {
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: true,
      }, 'Weak'),
    ).toBe('')
  })
})

describe('validateMatches', () => {
  it('should return empty string for matching values', () => {
    expect(validateMatches('abc', 'abc', 'Mismatch')).toBe('')
  })

  it('should return message for non-matching values', () => {
    expect(validateMatches('abc', 'xyz', 'Mismatch')).toBe('Mismatch')
  })
})

describe('validatePositiveNumber', () => {
  it('should return empty string for positive number', () => {
    expect(validatePositiveNumber(5, 'Invalid')).toBe('')
  })

  it('should return message for zero', () => {
    expect(validatePositiveNumber(0, 'Invalid')).toBe('Invalid')
  })

  it('should return message for negative number', () => {
    expect(validatePositiveNumber(-1, 'Invalid')).toBe('Invalid')
  })

  it('should return message for null value', () => {
    expect(validatePositiveNumber(null, 'Invalid')).toBe('Invalid')
  })

  it('should return empty string for string number', () => {
    expect(validatePositiveNumber('10', 'Invalid')).toBe('')
  })
})

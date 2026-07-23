import { describe, expect, it } from '@jest/globals'
import {
  createAggregateMoneyDisplay,
  createMoneyDisplay,
  normalizeCurrencyCode,
  normalizeMoneyDisplay,
} from './money'

describe('money utils', () => {
  it('normalizes numeric ISO currency codes sent as strings', () => {
    expect(normalizeCurrencyCode('704')).toBe('VND')
    expect(normalizeCurrencyCode('840')).toBe('USD')
    expect(normalizeCurrencyCode('978')).toBe('EUR')
  })

  it('preserves valid alpha ISO currency codes outside the hardcoded known set', () => {
    expect(normalizeCurrencyCode('sgd')).toBe('SGD')
    expect(createMoneyDisplay(1050, 'SGD')).toEqual({
      amount: 1050,
      currencyCode: 'SGD',
    })
  })

  it('keeps aggregate money valid when all currencies normalize to the same alpha code', () => {
    expect(createAggregateMoneyDisplay(1000, ['sgd', 'SGD'])).toEqual({
      amount: 1000,
      currencyCode: 'SGD',
    })
  })

  it('normalizes legacy numeric currency money payloads', () => {
    expect(normalizeMoneyDisplay({ amount: 149000, currency: 704 })).toEqual({
      amount: 149000,
      currencyCode: 'VND',
    })
  })

  it('preserves backend money issue metadata', () => {
    expect(
      normalizeMoneyDisplay({
        amount: 149000,
        currencyCode: 'VND',
        isValid: false,
        issueCode: 'invalid_money',
        displayPlaceholder: 'Contact support',
      }),
    ).toEqual({
      amount: 149000,
      currencyCode: 'VND',
      issue: {
        code: 'invalid_money',
        placeholder: 'Contact support',
      },
    })
  })
})

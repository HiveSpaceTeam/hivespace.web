import { describe, expect, it } from '@jest/globals'
import type {
  MoneyDisplay,
  MoneyIssue,
  PlatformCurrencyConfig,
  PlatformCurrencyConfigItem,
} from './money.types'

describe('money.types', () => {
  it('should expose shared money and platform currency contracts', () => {
    const issue: MoneyIssue = {
      code: 'missing_currency',
      placeholder: 'Invalid money',
    }

    const display: MoneyDisplay = {
      amount: 1050,
      currencyCode: 'USD',
      issue,
    }

    const item: PlatformCurrencyConfigItem = {
      currencyCode: 'USD',
      enabled: true,
    }

    const config: PlatformCurrencyConfig = {
      defaultCurrencyCode: 'USD',
      items: [item],
      version: 1,
    }

    expect(display.issue?.code).toBe('missing_currency')
    expect(config.items[0]?.currencyCode).toBe('USD')
  })
})

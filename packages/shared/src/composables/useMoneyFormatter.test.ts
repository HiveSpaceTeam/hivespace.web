import { describe, expect, it } from '@jest/globals'
import { createTestI18n } from '../test-utils'
import { useMoneyFormatter } from './useMoneyFormatter'

describe('useMoneyFormatter', () => {
  const i18n = createTestI18n()

  it('should render VND without fractional digits', () => {
    const { formatMoney } = useMoneyFormatter({
      t: i18n.global.t,
    })

    expect(formatMoney({ amount: 123456, currencyCode: 'VND' })).toBe('₫123,456')
  })

  it('should render USD/EUR smallest-unit values as major units by default', () => {
    const { formatMoney } = useMoneyFormatter({
      t: i18n.global.t,
    })

    expect(formatMoney({ amount: 1050, currencyCode: 'USD' })).toBe('$10.50')
    expect(formatMoney({ amount: 1050, currencyCode: 'EUR' })).toBe('€10.50')
  })

  it('should return invalid placeholder for missing currency', () => {
    const { formatMoney } = useMoneyFormatter({
      t: i18n.global.t,
    })

    expect(formatMoney({ amount: 1000, currencyCode: null })).toBe('Invalid money')
  })

  it('should render supported ISO alpha currencies outside the hardcoded known set', () => {
    const { formatMoney } = useMoneyFormatter({
      t: i18n.global.t,
    })

    expect(formatMoney({ amount: 1050, currencyCode: 'SGD' })).toBe('SGD 10.50')
  })
})

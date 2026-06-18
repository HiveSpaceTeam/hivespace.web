import { describe, expect, it } from '@jest/globals'
import { createTestI18n } from './i18n'

describe('createTestI18n', () => {
  it('returnsI18nInstance', () => {
    const i18n = createTestI18n()
    expect(i18n).toBeDefined()
    expect(i18n.global).toBeDefined()
    expect(typeof i18n.global.t).toBe('function')
  })

  it('defaultLocale_IsEnglish', () => {
    const i18n = createTestI18n()
    expect(i18n.global.locale.value).toBe('en')
  })

  it('translatesKey_FromSharedLocale', () => {
    const i18n = createTestI18n()
    const result = i18n.global.t('common.cancel')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
    expect(result).not.toBe('common.cancel')
  })

  it('withCustomMessages_MergesWithSharedLocale', () => {
    const i18n = createTestI18n({ customKey: 'Custom Value' })
    const result = i18n.global.t('customKey')
    expect(result).toBe('Custom Value')
  })

  it('missingKey_ReturnsFallbackOrKey', () => {
    const i18n = createTestI18n()
    const result = i18n.global.t('nonexistent.key.that.does.not.exist')
    expect(typeof result).toBe('string')
  })
})

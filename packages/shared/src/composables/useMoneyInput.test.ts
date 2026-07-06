import { describe, expect, it } from '@jest/globals'
import { ref } from 'vue'
import { useMoneyInput } from './useMoneyInput'

describe('useMoneyInput', () => {
  it('should convert USD/EUR major-unit input to smallest-unit payloads', () => {
    const modelValue = ref<number | null>(null)
    const currencyCode = ref('USD')
    const { handleInput, displayValue } = useMoneyInput(modelValue, currencyCode)

    const fakeEvent = {
      target: { value: '10.50' } as HTMLInputElement,
    } as unknown as Event

    handleInput(fakeEvent)

    expect(modelValue.value).toBe(1050)
    expect(displayValue.value).toBe('10.50')
  })

  it('should support ISO alpha currencies outside the hardcoded known set', () => {
    const modelValue = ref<number | null>(null)
    const currencyCode = ref('SGD')
    const { handleInput, displayValue } = useMoneyInput(modelValue, currencyCode)

    const fakeEvent = {
      target: { value: '10.50' } as HTMLInputElement,
    } as unknown as Event

    handleInput(fakeEvent)

    expect(modelValue.value).toBe(1050)
    expect(displayValue.value).toBe('10.50')
  })
})

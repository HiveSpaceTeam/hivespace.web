import { describe, expect, it } from '@jest/globals'
import { ref } from 'vue'
import { useNumberInputFormatter } from './useNumberInputFormatter'

describe('useNumberInputFormatter', () => {
  it('should return formatted string for a valid number', () => {
    const modelValue = ref<number | string | null | undefined>(1000)
    const { formatNumber } = useNumberInputFormatter(modelValue)
    expect(formatNumber(1000)).toBe('1,000')
  })

  it('should return empty string for null input', () => {
    const modelValue = ref<number | string | null | undefined>(null)
    const { formatNumber } = useNumberInputFormatter(modelValue)
    expect(formatNumber(null)).toBe('')
  })

  it('should format the model value as initial display value', () => {
    const modelValue = ref<number | string | null | undefined>(5000)
    const { displayValue } = useNumberInputFormatter(modelValue, 'en-US')
    expect(displayValue.value).toBe('5,000')
  })

  it('should strip non-numeric characters on input', () => {
    const modelValue = ref<number | string | null | undefined>(0)
    const { handleInput } = useNumberInputFormatter(modelValue)
    const fakeEvent = {
      target: { value: 'abc123def' } as HTMLInputElement,
    } as unknown as Event

    handleInput(fakeEvent)

    expect(modelValue.value).toBe(123)
  })

  it('should set model to empty when input contains only letters', () => {
    const modelValue = ref<number | string | null | undefined>(100)
    const { handleInput } = useNumberInputFormatter(modelValue)
    const fakeEvent = {
      target: { value: 'abc' } as HTMLInputElement,
    } as unknown as Event

    handleInput(fakeEvent)

    expect(modelValue.value).toBe('')
  })

  it('should reformat display value on blur', () => {
    const modelValue = ref<number | string | null | undefined>(2500)
    const { displayValue, handleBlur } = useNumberInputFormatter(modelValue, 'en-US')
    modelValue.value = 3000

    handleBlur({} as Event)

    expect(displayValue.value).toBe('3,000')
  })
})

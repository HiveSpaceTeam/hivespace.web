import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useCooldown } from './useCooldown'

let cooldownResult: ReturnType<typeof useCooldown> | null = null

const makeCooldownComponent = (durationSeconds: number) =>
  defineComponent({
    setup() {
      cooldownResult = useCooldown(durationSeconds)
      return () => null
    },
  })

beforeEach(() => {
  jest.useFakeTimers()
  cooldownResult = null
})

afterEach(() => {
  jest.useRealTimers()
})

describe('useCooldown', () => {
  it('should not be active in initial state', () => {
    mount(makeCooldownComponent(30))
    expect(cooldownResult!.isActive.value).toBe(false)
    expect(cooldownResult!.secondsRemaining.value).toBe(30)
  })

  it('should be active after starting', () => {
    mount(makeCooldownComponent(30))
    cooldownResult!.start()
    expect(cooldownResult!.isActive.value).toBe(true)
    expect(cooldownResult!.secondsRemaining.value).toBe(30)
  })

  it('should decrement seconds after one tick', () => {
    mount(makeCooldownComponent(30))
    cooldownResult!.start()
    jest.advanceTimersByTime(1000)
    expect(cooldownResult!.secondsRemaining.value).toBe(29)
  })

  it('should become inactive after full duration', () => {
    mount(makeCooldownComponent(3))
    cooldownResult!.start()
    jest.advanceTimersByTime(3000)
    expect(cooldownResult!.isActive.value).toBe(false)
  })

  it('should clear active state when stopped', () => {
    mount(makeCooldownComponent(30))
    cooldownResult!.start()
    cooldownResult!.stop()
    expect(cooldownResult!.isActive.value).toBe(false)
    expect(cooldownResult!.secondsRemaining.value).toBe(30)
  })

  it('should stop timer on unmount', () => {
    const wrapper = mount(makeCooldownComponent(30))
    cooldownResult!.start()
    wrapper.unmount()
    expect(cooldownResult!.isActive.value).toBe(false)
  })
})

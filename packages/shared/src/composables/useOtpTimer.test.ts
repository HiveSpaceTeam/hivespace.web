import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { nextTick } from 'vue'
import { useOtpTimer } from './useOtpTimer'

describe('useOtpTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-12-01T00:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should expose active countdown state for a future timestamp', async () => {
    const timer = useOtpTimer('2026-12-01T00:01:30Z')

    expect(timer.isExpired.value).toBe(false)
    expect(timer.remainingSeconds.value).toBe(90)
    expect(timer.displayValue.value).toBe('01:30')

    jest.advanceTimersByTime(1000)
    await nextTick()

    expect(timer.remainingSeconds.value).toBe(89)
    expect(timer.displayValue.value).toBe('01:29')
  })

  it('should expose expired state for a past timestamp', () => {
    const timer = useOtpTimer('2026-11-30T23:59:00Z')

    expect(timer.isExpired.value).toBe(true)
    expect(timer.remainingSeconds.value).toBe(0)
    expect(timer.displayValue.value).toBe('00:00')
  })

  it('should support updating the target timestamp for resend and expiry timers', async () => {
    const timer = useOtpTimer('2026-12-01T00:00:10Z')

    expect(timer.displayValue.value).toBe('00:10')

    timer.setTarget('2026-12-01T00:02:05Z')
    await nextTick()

    expect(timer.isExpired.value).toBe(false)
    expect(timer.remainingSeconds.value).toBe(125)
    expect(timer.displayValue.value).toBe('02:05')
  })

  it('should treat null and invalid timestamps as expired', () => {
    const nullTimer = useOtpTimer(null)
    const invalidTimer = useOtpTimer('not-a-date')

    expect(nullTimer.isExpired.value).toBe(true)
    expect(nullTimer.remainingSeconds.value).toBe(0)
    expect(nullTimer.displayValue.value).toBe('00:00')

    expect(invalidTimer.isExpired.value).toBe(true)
    expect(invalidTimer.remainingSeconds.value).toBe(0)
    expect(invalidTimer.displayValue.value).toBe('00:00')
  })

  it('should stop at zero after the target expires', async () => {
    const timer = useOtpTimer('2026-12-01T00:00:01Z')

    jest.advanceTimersByTime(1500)
    await nextTick()

    expect(timer.isExpired.value).toBe(true)
    expect(timer.remainingSeconds.value).toBe(0)
    expect(timer.displayValue.value).toBe('00:00')

    jest.advanceTimersByTime(5_000)
    await nextTick()

    expect(timer.remainingSeconds.value).toBe(0)
    expect(timer.displayValue.value).toBe('00:00')
  })
})

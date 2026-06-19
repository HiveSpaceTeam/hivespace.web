import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { useDebounce } from './useDebounce'

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('useDebounce', () => {
  it('should execute only the last call when key is the same', () => {
    const { debounce } = useDebounce()
    const cb = jest.fn()

    debounce('search', cb, 400)
    debounce('search', cb, 400)
    debounce('search', cb, 400)

    jest.advanceTimersByTime(400)

    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('should execute both calls independently when keys differ', () => {
    const { debounce } = useDebounce()
    const cb1 = jest.fn()
    const cb2 = jest.fn()

    debounce('key1', cb1, 200)
    debounce('key2', cb2, 200)

    jest.advanceTimersByTime(200)

    expect(cb1).toHaveBeenCalledTimes(1)
    expect(cb2).toHaveBeenCalledTimes(1)
  })

  it('should not execute callback before the delay', () => {
    const { debounce } = useDebounce()
    const cb = jest.fn()

    debounce('key', cb, 400)
    jest.advanceTimersByTime(399)

    expect(cb).not.toHaveBeenCalled()
  })

  it('should execute callback after the delay', () => {
    const { debounce } = useDebounce()
    const cb = jest.fn()

    debounce('key', cb, 400)
    jest.advanceTimersByTime(400)

    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('should default to a 400ms delay', () => {
    const { debounce } = useDebounce()
    const cb = jest.fn()

    debounce('key', cb)

    jest.advanceTimersByTime(399)
    expect(cb).not.toHaveBeenCalled()

    jest.advanceTimersByTime(1)
    expect(cb).toHaveBeenCalledTimes(1)
  })
})

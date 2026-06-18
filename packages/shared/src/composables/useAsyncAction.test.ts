import { describe, expect, it } from '@jest/globals'
import { useAsyncAction } from './useAsyncAction'

describe('useAsyncAction', () => {
  it('should set loading to true during execution', async () => {
    const { isLoading, run } = useAsyncAction()
    let loadingDuring = false
    await run(async () => {
      loadingDuring = isLoading.value
    })
    expect(loadingDuring).toBe(true)
  })

  it('should set loading to false after completion', async () => {
    const { isLoading, run } = useAsyncAction()
    await run(async () => 'result')
    expect(isLoading.value).toBe(false)
  })

  it('should return the value from the function', async () => {
    const { run } = useAsyncAction()
    const result = await run(async () => 42)
    expect(result).toBe(42)
  })

  it('should set loading to false after rejection', async () => {
    const { isLoading, run } = useAsyncAction()
    await expect(run(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    expect(isLoading.value).toBe(false)
  })
})

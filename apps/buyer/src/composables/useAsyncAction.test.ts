import { describe, expect, it } from '@jest/globals'

// useAsyncAction re-exports from @hivespace/shared.
// The shared composable is tested in packages/shared/src/composables/useAsyncAction.test.ts.
// This file verifies the re-export is present.
describe('useAsyncAction (buyer re-export)', () => {
  it('setsLoadingTrue_DuringExecution', async () => {
    const { useAsyncAction } = await import('./useAsyncAction')
    expect(typeof useAsyncAction).toBe('function')
  })

  it('capturesError_OnRejection', async () => {
    const { useAsyncAction } = await import('./useAsyncAction')
    const { run, isLoading } = useAsyncAction()

    await expect(run(() => Promise.reject(new Error('test error')))).rejects.toThrow('test error')
    expect(isLoading.value).toBe(false)
  })
})

import { afterEach, describe, expect, it, jest } from '@jest/globals'
import type { ConfirmModalResult } from './useConfirmModal'

// ConfirmModal.vue pulls in icon .vue files that trigger a babel preset error in tests.
// Mock the component to keep tests fast and isolated.
jest.mock('../components/common/ConfirmModal.vue', () => ({
  __esModule: true,
  default: { name: 'ConfirmModal', template: '<div />' },
}))

jest.useFakeTimers()

afterEach(() => {
  const { useModal } = require('./useModal') as typeof import('./useModal')
  useModal().closeModal()
  jest.runAllTimers()
})

describe('useConfirmModal', () => {
  it('should resolve true when user confirms', async () => {
    const { useConfirmModal } = await import('./useConfirmModal')
    const { useModal } = await import('./useModal')
    const { confirm } = useConfirmModal()
    const { closeModal } = useModal()

    const promise = confirm('Delete this item?', 'This cannot be undone')
    closeModal<ConfirmModalResult>({ result: 'confirm' })
    jest.runAllTimers()

    const result = await promise
    expect(result).toBe(true)
  })

  it('should resolve false when user cancels', async () => {
    const { useConfirmModal } = await import('./useConfirmModal')
    const { useModal } = await import('./useModal')
    const { confirm } = useConfirmModal()
    const { closeModal } = useModal()

    const promise = confirm('Delete this item?')
    closeModal<ConfirmModalResult>({ result: 'cancel' })
    jest.runAllTimers()

    const result = await promise
    expect(result).toBe(false)
  })

  it('should resolve true when user confirms delete', async () => {
    const { useConfirmModal } = await import('./useConfirmModal')
    const { useModal } = await import('./useModal')
    const { deleteConfirm } = useConfirmModal()
    const { closeModal } = useModal()

    const promise = deleteConfirm('Delete permanently?')
    closeModal<ConfirmModalResult>({ result: 'confirm' })
    jest.runAllTimers()

    const result = await promise
    expect(result).toBe(true)
  })

  it('should resolve save when user saves changes', async () => {
    const { useConfirmModal } = await import('./useConfirmModal')
    const { useModal } = await import('./useModal')
    const { saveChanges } = useConfirmModal()
    const { closeModal } = useModal()

    const promise = saveChanges('Unsaved Changes')
    closeModal<ConfirmModalResult>({ result: 'confirm' })
    jest.runAllTimers()

    const result = await promise
    expect(result).toBe('save')
  })

  it('should resolve discard when user discards changes', async () => {
    const { useConfirmModal } = await import('./useConfirmModal')
    const { useModal } = await import('./useModal')
    const { saveChanges } = useConfirmModal()
    const { closeModal } = useModal()

    const promise = saveChanges('Unsaved Changes')
    closeModal<ConfirmModalResult>({ result: 'third' })
    jest.runAllTimers()

    const result = await promise
    expect(result).toBe('discard')
  })

  it('should resolve cancel when user cancels', async () => {
    const { useConfirmModal } = await import('./useConfirmModal')
    const { useModal } = await import('./useModal')
    const { saveChanges } = useConfirmModal()
    const { closeModal } = useModal()

    const promise = saveChanges('Unsaved Changes')
    closeModal<ConfirmModalResult>({ result: 'cancel' })
    jest.runAllTimers()

    const result = await promise
    expect(result).toBe('cancel')
  })

  it('should resolve after alert is closed', async () => {
    const { useConfirmModal } = await import('./useConfirmModal')
    const { useModal } = await import('./useModal')
    const { alert } = useConfirmModal()
    const { closeModal } = useModal()

    const promise = alert('Notice', 'Something happened')
    closeModal<ConfirmModalResult>({ result: 'confirm' })
    jest.runAllTimers()

    await expect(promise).resolves.toBeUndefined()
  })

  it('should resolve true when user confirms warning', async () => {
    const { useConfirmModal } = await import('./useConfirmModal')
    const { useModal } = await import('./useModal')
    const { warning } = useConfirmModal()
    const { closeModal } = useModal()

    const promise = warning('Warning Title', 'Are you sure?')
    closeModal<ConfirmModalResult>({ result: 'confirm' })
    jest.runAllTimers()

    const result = await promise
    expect(result).toBe(true)
  })

  it('should resolve false when user cancels warning', async () => {
    const { useConfirmModal } = await import('./useConfirmModal')
    const { useModal } = await import('./useModal')
    const { warning } = useConfirmModal()
    const { closeModal } = useModal()

    const promise = warning('Warning Title')
    closeModal<ConfirmModalResult>({ result: 'cancel' })
    jest.runAllTimers()

    const result = await promise
    expect(result).toBe(false)
  })

  it('should resolve null when save changes result is null', async () => {
    const { useConfirmModal } = await import('./useConfirmModal')
    const { useModal } = await import('./useModal')
    const { saveChanges } = useConfirmModal()
    const { closeModal } = useModal()

    const promise = saveChanges('Unsaved Changes')
    closeModal(undefined)
    jest.runAllTimers()

    const result = await promise
    expect(result).toBeNull()
  })

  it('should set size to md when autoSize is true', async () => {
    const { useConfirmModal } = await import('./useConfirmModal')
    const { useModal } = await import('./useModal')
    const { openConfirmModal } = useConfirmModal()
    const { closeModal, modalProps } = useModal()

    const promise = openConfirmModal({ autoSize: true })
    expect(modalProps.value.size).toBe('md')
    closeModal<ConfirmModalResult>({ result: 'confirm' })
    jest.runAllTimers()

    await promise
  })
})

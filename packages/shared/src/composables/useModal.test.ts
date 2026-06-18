import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { defineComponent } from 'vue'
import { useModal } from './useModal'

jest.useFakeTimers()

const FakeComponent = defineComponent({ template: '<div />' })

afterEach(() => {
  const { closeModal } = useModal()
  closeModal()
  jest.runAllTimers()
})

describe('useModal', () => {
  it('should not be open in initial state', () => {
    const { isOpen } = useModal()
    expect(isOpen.value).toBe(false)
  })

  it('should set isOpen to true when opening modal', () => {
    const { openModal, isOpen } = useModal()

    openModal(FakeComponent)

    expect(isOpen.value).toBe(true)
  })

  it('should set modal component when opening modal', () => {
    const { openModal, modalComponent } = useModal()

    openModal(FakeComponent)

    expect(modalComponent.value).not.toBeNull()
  })

  it('should set props when opening modal', () => {
    const { openModal, modalProps } = useModal()

    openModal(FakeComponent, { title: 'Test Title' })

    expect(modalProps.value.title).toBe('Test Title')
  })

  it('should set isOpen to false when closing modal', () => {
    const { openModal, closeModal, isOpen } = useModal()
    openModal(FakeComponent)

    closeModal()

    expect(isOpen.value).toBe(false)
  })

  it('should resolve promise when modal is closed', async () => {
    const { openModal, closeModal } = useModal()

    const promise = openModal<string>(FakeComponent)
    closeModal('result-value')
    jest.runAllTimers()

    const result = await promise
    expect(result).toBe('result-value')
  })

  it('should clear component after timeout on close', () => {
    const { openModal, closeModal, modalComponent } = useModal()
    openModal(FakeComponent)
    closeModal()

    jest.advanceTimersByTime(200)

    expect(modalComponent.value).toBeNull()
  })
})

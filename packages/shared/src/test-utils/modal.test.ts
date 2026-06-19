import { afterEach, describe, expect, it } from '@jest/globals'
import { defineComponent } from 'vue'
import { openModal, closeAllModals } from './modal'

const FakeModalComponent = defineComponent({
  name: 'FakeModalComponent',
  template: '<div data-testid="fake-modal">Modal Content</div>',
})

afterEach(() => {
  closeAllModals()
})

describe('openModal', () => {
  it('mountsComponent_AndReturnsWrapper', () => {
    const wrapper = openModal(FakeModalComponent)
    expect(wrapper).toBeDefined()
    expect(wrapper.exists()).toBe(true)
  })

  it('passesProps_ToComponent', () => {
    const ComponentWithProps = defineComponent({
      props: ['title'],
      template: '<div>{{ title }}</div>',
    })
    const wrapper = openModal(ComponentWithProps, { title: 'Test Title' })
    expect(wrapper.props('title')).toBe('Test Title')
  })
})

describe('closeAllModals', () => {
  it('unmountsAllOpenModals', () => {
    const wrapper1 = openModal(FakeModalComponent)
    const wrapper2 = openModal(FakeModalComponent)

    closeAllModals()

    expect(wrapper1.exists()).toBe(false)
    expect(wrapper2.exists()).toBe(false)
  })

  it('idempotent_WhenCalledMultipleTimes', () => {
    openModal(FakeModalComponent)
    closeAllModals()
    expect(() => closeAllModals()).not.toThrow()
  })
})

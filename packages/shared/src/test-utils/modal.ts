import type { Component } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createVfm } from 'vue-final-modal'

const wrappers: VueWrapper[] = []

export const openModal = (component: Component, props: object = {}) => {
  const wrapper = mount(component, {
    props,
    global: {
      plugins: [createVfm()],
    },
  })
  wrappers.push(wrapper)
  return wrapper
}

export const closeAllModals = () => {
  wrappers.splice(0, wrappers.length).forEach(wrapper => wrapper.unmount())
}

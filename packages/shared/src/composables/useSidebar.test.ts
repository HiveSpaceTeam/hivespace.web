import { beforeEach, describe, expect, it } from '@jest/globals'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useSidebar, useSidebarProvider } from './useSidebar'

let sidebarCtx: ReturnType<typeof useSidebar> | null = null

const ChildConsumer = defineComponent({
  name: 'ChildConsumer',
  setup() {
    sidebarCtx = useSidebar()
    return () => null
  },
})

const makeParentProvider = () =>
  defineComponent({
    name: 'ParentProvider',
    setup() {
      useSidebarProvider()
      return () => h(ChildConsumer)
    },
  })

beforeEach(() => {
  sidebarCtx = null
  Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true })
})

describe('useSidebar', () => {
  it('should throw when used without provider', () => {
    expect(() => useSidebar()).toThrow('useSidebar must be used within')
  })

  it('should provide context to children', () => {
    mount(makeParentProvider())
    expect(sidebarCtx).not.toBeNull()
  })

  it('should default to expanded on desktop', () => {
    mount(makeParentProvider())
    expect(sidebarCtx!.isExpanded.value).toBe(true)
  })

  it('should flip expanded state when toggling sidebar on desktop', () => {
    mount(makeParentProvider())
    expect(sidebarCtx!.isExpanded.value).toBe(true)

    sidebarCtx!.toggleSidebar()

    expect(sidebarCtx!.isExpanded.value).toBe(false)
  })

  it('should flip mobile open state when toggling mobile sidebar', () => {
    mount(makeParentProvider())
    expect(sidebarCtx!.isMobileOpen.value).toBe(false)

    sidebarCtx!.toggleMobileSidebar()

    expect(sidebarCtx!.isMobileOpen.value).toBe(true)
  })

  it('should update active item when set', () => {
    mount(makeParentProvider())

    sidebarCtx!.setActiveItem('dashboard')

    expect(sidebarCtx!.activeItem.value).toBe('dashboard')
  })

  it('should open submenu when toggled', () => {
    mount(makeParentProvider())

    sidebarCtx!.toggleSubmenu('products')

    expect(sidebarCtx!.openSubmenu.value).toBe('products')
  })

  it('should close submenu when same item is toggled again', () => {
    mount(makeParentProvider())
    sidebarCtx!.toggleSubmenu('products')

    sidebarCtx!.toggleSubmenu('products')

    expect(sidebarCtx!.openSubmenu.value).toBeNull()
  })
})

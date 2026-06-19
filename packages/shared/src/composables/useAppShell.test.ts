import { describe, expect, it, jest } from '@jest/globals'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { provideAppShell, useAppShell, type AppShellContext } from './useAppShell'

const makeMockContext = (): AppShellContext => ({
  menuGroups: ref([]),
  notifications: ref([]),
  unreadCount: ref(0),
  notificationLoading: ref(false),
  hasMore: ref(false),
  markAsRead: jest.fn() as unknown as (id: string) => void,
  fetchNotifications: jest.fn() as unknown as (unreadOnly: boolean) => void,
  loadMore: jest.fn() as unknown as () => void,
  themeChange: jest.fn() as unknown as () => Promise<void>,
  cultureChange: jest.fn() as unknown as () => Promise<void>,
})

describe('useAppShell', () => {
  it('should throw when used without provider', () => {
    expect(() => useAppShell()).toThrow('useAppShell must be used within')
  })

  it('should return context when used with provider', () => {
    const mockContext = makeMockContext()
    let shellCtx: AppShellContext | null = null

    const Child = defineComponent({
      name: 'Child',
      setup() {
        shellCtx = useAppShell()
        return () => null
      },
    })

    const Parent = defineComponent({
      name: 'Parent',
      setup() {
        provideAppShell(mockContext)
        return () => h(Child)
      },
    })

    mount(Parent)

    expect(shellCtx).not.toBeNull()
    expect(shellCtx!.unreadCount).toBe(mockContext.unreadCount)
    expect(shellCtx!.notifications).toBe(mockContext.notifications)
  })

  it('should return the same context ref via inject', () => {
    const mockContext = makeMockContext()
    let shellCtx: AppShellContext | null = null

    const Child = defineComponent({
      name: 'Child',
      setup() {
        shellCtx = useAppShell()
        return () => null
      },
    })

    const Parent = defineComponent({
      name: 'Parent',
      setup() {
        provideAppShell(mockContext)
        return () => h(Child)
      },
    })

    mount(Parent)

    expect(shellCtx!.menuGroups).toBe(mockContext.menuGroups)
    expect(shellCtx!.hasMore).toBe(mockContext.hasMore)
  })
})

import { provide, inject, type Ref } from 'vue'
import type { SidebarMenuGroup } from '../types/sidebar.types'
import type { MenuItem } from '../types/component.common'
import type { InAppNotification } from '../features/notifications/notifications.types'
import type { CultureText, ThemeText } from '../features/user-settings'

const AppShellSymbol = Symbol('AppShell')

export interface AppShellContext {
  menuGroups: Ref<SidebarMenuGroup[]>
  menuItems?: MenuItem[]
  fullHeight?: boolean
  currentUserDisplayName?: Ref<string>
  currentUserFullName?: Ref<string>
  currentUserEmail?: Ref<string>
  currentUserAvatarSrc?: Ref<string>
  loadCurrentUserProfile?: (force?: boolean) => Promise<void>
  notifications: Ref<InAppNotification[]>
  unreadCount: Ref<number>
  notificationLoading: Ref<boolean>
  hasMore: Ref<boolean>
  markAsRead: (id: string) => void
  fetchNotifications: (unreadOnly: boolean) => void
  loadMore: () => void
  themeChange: (theme: ThemeText) => Promise<void>
  cultureChange: (culture: CultureText) => Promise<void>
}

export function provideAppShell(context: AppShellContext): void {
  provide(AppShellSymbol, context)
}

export function useAppShell(): AppShellContext {
  const context = inject<AppShellContext>(AppShellSymbol)
  if (!context) {
    throw new Error('useAppShell must be used within a component that has provideAppShell as an ancestor')
  }
  return context
}

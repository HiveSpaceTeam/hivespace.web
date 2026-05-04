<template>
  <SidebarProvider>
    <RouterView @navigate="handleNavigate" />
  </SidebarProvider>
  <ModalManager />
  <ToastContainer :toasts="appStore.notifications" @removeToast="appStore.removeNotification" />
  <NotificationPreviewToast
    :toasts="toastQueue"
    @dismiss="notificationStore.dismissToast"
    @click="handleToastClick"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ModalManager,
  NotificationPreviewToast,
  SidebarProvider,
  ToastContainer,
  useAppStore,
  useNotificationRealtime,
  provideAppShell,
  BoxIcon,
  GridIcon,
  ListIcon,
  TableIcon,
  UserCircleIcon,
  SettingsIcon,
  SupportIcon,
  type SidebarMenuGroup,
  type SidebarMenuItem,
  type MenuItem,
  stringToNumericTheme,
  stringToNumericCulture,
} from '@hivespace/shared'
import { useNotificationStore, useUserSettingsStore } from '@/stores'
import { config, isDevelopment } from '@/config'

const appStore = useAppStore()
const router = useRouter()
const { t } = useI18n()
const notificationStore = useNotificationStore()
const userSettingsStore = useUserSettingsStore()
const { notifications, unreadCount, isLoading: notificationLoading, hasMore, toastQueue } = storeToRefs(notificationStore)

useNotificationRealtime({
  hubBaseUrl: config.api.baseUrl,
  onReceive: (event) => notificationStore.prependFromHub(event),
  onConnected: async () => {
    await notificationStore.fetchUnreadCount()
  },
})

const menuItems: MenuItem[] = [
  { href: '/profile', icon: UserCircleIcon, textKey: 'common.profile.editProfile' },
  { href: '/chat', icon: SettingsIcon, textKey: 'common.profile.accountSettings' },
  { href: '/profile', icon: SupportIcon, textKey: 'common.profile.support' },
]

const menuGroups = computed<SidebarMenuGroup[]>(() => {
  const items: SidebarMenuItem[] = [
    {
      name: t('pages.orders'),
      icon: ListIcon,
      subItems: [
        { name: t('pages.orderAll'), path: '/orders/all' },
      ],
    },
    {
      name: t('pages.products'),
      icon: TableIcon,
      subItems: [
        { name: t('pages.productList'), path: '/product/list' },
        { name: t('pages.addNewProduct'), path: '/product/new' },
      ],
    },
    {
      name: t('pages.marketing') || 'Marketing',
      icon: BoxIcon,
      subItems: [
        { name: t('pages.coupons') || 'Coupons', path: '/marketing/coupons' },
      ],
    },
  ]
  if (isDevelopment()) {
    items.push({ icon: GridIcon, name: 'Demo', path: '/demo' })
  }
  return [{ title: t('common.sidebar.menu'), items }]
})

provideAppShell({
  menuGroups,
  menuItems,
  fullHeight: false,
  notifications,
  unreadCount,
  notificationLoading,
  hasMore,
  markAsRead: notificationStore.markAsRead,
  fetchNotifications: notificationStore.fetchNotifications,
  loadMore: notificationStore.loadMore,
  themeChange: async (theme) => { await userSettingsStore.updateTheme(stringToNumericTheme(theme)) },
  cultureChange: async (culture) => {
    await userSettingsStore.updateCulture(stringToNumericCulture(culture))
  },
})

const handleNavigate = (path: string) => {
  router.push(path)
}

const handleToastClick = (id: string) => {
  const notification = toastQueue.value.find((toast) => toast.id === id)
  void notificationStore.markAsRead(id).catch((error) => {
    console.error('Failed to mark notification as read:', error)
  })
  notificationStore.dismissToast(id)
  router.push(notification?.link ?? '/notifications')
}
</script>

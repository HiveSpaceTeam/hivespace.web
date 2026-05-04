<template>
  <SidebarProvider>
    <RouterView @navigate="handleNavigate" />
  </SidebarProvider>
  <ModalManager />
  <ToastContainer :toasts="appStore.notifications" @removeToast="appStore.removeNotification" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ToastContainer,
  SidebarProvider,
  ModalManager,
  useAppStore,
  provideAppShell,
  TableIcon,
  GridIcon,
  UserCircleIcon,
  SettingsIcon,
  SupportIcon,
  type SidebarMenuGroup,
  type SidebarMenuItem,
  type MenuItem,
  stringToNumericTheme,
  stringToNumericCulture,
} from '@hivespace/shared'
import { useNotificationStore, useProfileStore, useUserSettingsStore } from '@/stores'
import { isDevelopment } from '@/config'

const appStore = useAppStore()
const router = useRouter()
const { t } = useI18n()
const notificationStore = useNotificationStore()
const profileStore = useProfileStore()
const userSettingsStore = useUserSettingsStore()
const { notifications, unreadCount, isLoading: notificationLoading, hasMore } = storeToRefs(notificationStore)
const { myProfile } = storeToRefs(profileStore)

const currentUserDisplayName = computed(() => {
  return myProfile.value?.userName?.trim() || myProfile.value?.fullName?.trim() || ''
})

const currentUserFullName = computed(() => {
  return myProfile.value?.fullName?.trim() || myProfile.value?.userName?.trim() || ''
})

const currentUserEmail = computed(() => myProfile.value?.email?.trim() || '')

const currentUserAvatarSrc = computed(() => myProfile.value?.avatarUrl?.trim() || '')

const menuItems: MenuItem[] = [
  { href: '/profile', icon: UserCircleIcon, textKey: 'common.profile.editProfile' },
  { href: '/chat', icon: SettingsIcon, textKey: 'common.profile.accountSettings' },
  { href: '/profile', icon: SupportIcon, textKey: 'common.profile.support' },
]

const menuGroups = computed<SidebarMenuGroup[]>(() => {
  const items: SidebarMenuItem[] = [
    {
      name: t('pages.accounts'),
      icon: TableIcon,
      subItems: [
        { name: t('pages.userManagement'), path: '/account/user-management' },
        { name: t('pages.adminManagement'), path: '/account/admin-management' },
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
  fullHeight: true,
  currentUserDisplayName,
  currentUserFullName,
  currentUserEmail,
  currentUserAvatarSrc,
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
</script>

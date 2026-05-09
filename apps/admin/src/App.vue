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
  LayoutDashboardIcon,
  UserGroupIcon,
  ListIcon,
  ShieldIcon,
  WarningIcon,
  TaskIcon,
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
  const platformItems: SidebarMenuItem[] = [
    { name: t('pages.dashboard.title'), icon: LayoutDashboardIcon, path: '/dashboard' },
    { name: t('pages.adminManagement'), icon: TableIcon, path: '/account/admin-management' },
    { name: t('pages.buyer'), icon: UserCircleIcon, path: '/account/user-management' },
    { name: t('pages.merchants.title'), icon: UserGroupIcon, path: '/merchants' },
    { name: t('pages.auditLog'), icon: ListIcon, path: '#' },
    { name: t('pages.configuration.title'), icon: SettingsIcon, path: '/configuration' },
  ]

  if (isDevelopment()) {
    platformItems.push({ icon: GridIcon, name: 'Demo', path: '/demo' })
  }

  const complianceItems: SidebarMenuItem[] = [
    { name: t('pages.kycQueue'), icon: ShieldIcon, path: '#' },
    { name: t('pages.disputes'), icon: WarningIcon, path: '#' },
    { name: t('pages.scheduledJobs'), icon: TaskIcon, path: '#' },
  ]

  return [
    { title: 'Platform', items: platformItems },
    { title: 'Compliance', items: complianceItems },
  ]
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

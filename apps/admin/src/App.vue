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
  GridIcon,
  UserCircleIcon,
  SettingsIcon,
  SupportIcon,
  UserGroupIcon,
  FolderIcon,
  InfoIcon,
  ShieldIcon,
  ChatIcon,
  CalenderIcon,
  type SidebarMenuGroup,
  type SidebarMenuItem,
  type MenuItem,
  type ThemeText,
  type CultureText,
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

const loadCurrentUserProfile = async (force = false) => {
  if (!force && myProfile.value) return
  await profileStore.fetchMyProfile()
}

const menuItems: MenuItem[] = [
  { href: '/profile', icon: UserCircleIcon, textKey: 'common.profile.editProfile' },
  { href: '/chat', icon: SettingsIcon, textKey: 'common.profile.accountSettings' },
  { href: '/profile', icon: SupportIcon, textKey: 'common.profile.support' },
]

const menuGroups = computed<SidebarMenuGroup[]>(() => {
  const platformItems: SidebarMenuItem[] = [
    { name: t('dashboard.title'), icon: GridIcon, path: '/dashboard' },
    { name: t('common.accounts'), icon: UserGroupIcon, path: '/accounts', badge: '25', badgeTone: 'primary' },
    { name: t('buyers.title'), icon: UserCircleIcon, path: '/buyers', badge: '842k', badgeTone: 'success' },
    { name: t('merchants.title'), icon: FolderIcon, path: '/merchants', badge: '12,487', badgeTone: 'light' },
    { name: t('common.auditLog'), icon: InfoIcon, path: '/audit-log', badge: '3', badgeTone: 'error' },
    { name: t('configuration.title'), icon: SettingsIcon, path: '/configuration' },
  ]
  const complianceItems: SidebarMenuItem[] = [
    { name: t('common.kycQueue'), icon: ShieldIcon, path: '/kyc-queue', badge: '14', badgeTone: 'error' },
    { name: t('common.disputes'), icon: ChatIcon, path: '/disputes' },
    { name: t('common.scheduledJobs'), icon: CalenderIcon, path: '/scheduled-jobs' },
  ]

  if (isDevelopment()) {
    complianceItems.push({ icon: GridIcon, name: 'Demo', path: '/demo' })
  }

  return [
    { title: t('common.sidebar.groups.platform'), items: platformItems },
    { title: t('common.sidebar.groups.compliance'), items: complianceItems },
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
  loadCurrentUserProfile,
  notifications,
  unreadCount,
  notificationLoading,
  hasMore,
  markAsRead: notificationStore.markAsRead,
  fetchNotifications: notificationStore.fetchNotifications,
  loadMore: notificationStore.loadMore,
  themeChange: async (theme: ThemeText) => { await userSettingsStore.updateTheme(theme) },
  cultureChange: async (culture: CultureText) => {
    await userSettingsStore.updateCulture(culture)
  },
})

const handleNavigate = (path: string) => {
  router.push(path)
}
</script>

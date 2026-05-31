<template>
  <StorefrontLayout v-if="showDefaultLayout">
    <RouterView @navigate="handleNavigate" />
  </StorefrontLayout>
  <RouterView v-else @navigate="handleNavigate" />
  <!-- Global modal outlet -->
  <ModalManager />
  <!-- Global toast notifications -->
  <ToastContainer :toasts="appToasts" @removeToast="appStore.removeNotification" />
  <!-- In-app notification preview toasts -->
  <NotificationPreviewToast :toasts="toastQueue" @dismiss="notificationStore.dismissToast" @click="handleToastClick" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import {
  ToastContainer,
  ModalManager,
  useAppStore,
  provideAppShell,
  useNotificationRealtime,
  NotificationPreviewToast,
  UserCircleIcon,
  type InAppNotification,
  type SidebarMenuGroup,
  type MenuItem,
  type ThemeText,
  type CultureText,
} from '@hivespace/shared'
import { ShoppingBag } from 'lucide-vue-next'
import StorefrontLayout from '@/components/layout/StorefrontLayout.vue'
import { useNotificationStore, useProfileStore, useUserSettingsStore } from '@/stores'
import { config } from '@/config'

const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

const notificationStore = useNotificationStore()
const profileStore = useProfileStore()
const userSettingsStore = useUserSettingsStore()
const { notifications, unreadCount, isLoading: notificationLoading, hasMore } = storeToRefs(notificationStore)
const { myProfile } = storeToRefs(profileStore)
const appToasts = computed(() => appStore.notifications)
const toastQueue = computed<InAppNotification[]>(() => notificationStore.toastQueue)

const showDefaultLayout = computed(() => route.meta?.layout !== 'none')

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

const menuGroups = computed<SidebarMenuGroup[]>(() => [])

const menuItems: MenuItem[] = [
  { href: '/profile', icon: UserCircleIcon, textKey: 'storefront.profile.myAccount' },
  { href: '/orders', icon: ShoppingBag, textKey: 'storefront.profile.myOrders' },
]

const handleNavigate = (path: string) => {
  router.push(path)
}

useNotificationRealtime({
  hubBaseUrl: config.api.baseUrl,
  onReceive: (event) => notificationStore.prependFromHub(event),
  onConnected: async () => {
    await notificationStore.fetchUnreadCount()
  },
})

const handleToastClick = (id: string) => {
  const notification = toastQueue.value.find((n) => n.id === id)
  void notificationStore.markAsRead(id).catch((error) => {
    console.error('Failed to mark notification as read:', error)
  })
  notificationStore.dismissToast(id)
  router.push(notification?.link ?? '/')
}

provideAppShell({
  menuGroups,
  menuItems,
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
  themeChange: async (theme: ThemeText) => {
    await userSettingsStore.updateTheme(theme)
  },
  cultureChange: async (culture: CultureText) => {
    await userSettingsStore.updateCulture(culture)
  },
})
</script>

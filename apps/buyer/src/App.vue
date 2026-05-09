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
import { useRouter, useRoute } from 'vue-router'
import {
  ToastContainer,
  ModalManager,
  useAppStore,
  useNotificationRealtime,
  NotificationPreviewToast,
  type InAppNotification,
} from '@hivespace/shared'
import StorefrontLayout from '@/components/layout/StorefrontLayout.vue'
import { useNotificationStore } from '@/stores'
import { config } from '@/config'

const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

const notificationStore = useNotificationStore()
const appToasts = computed(() => appStore.notifications)
const toastQueue = computed<InAppNotification[]>(() => notificationStore.toastQueue)

const showDefaultLayout = computed(() => route.meta?.layout !== 'none')

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
</script>

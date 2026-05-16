<template>
  <div class="p-4 mx-auto max-w-3xl sm:p-6">
    <h1 class="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
      {{ $t('notification.title') }}
    </h1>

    <div v-if="isLoading && notifications.length === 0"
      class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] divide-y divide-gray-100 dark:divide-gray-800">
      <div v-for="i in 5" :key="i" class="h-20 animate-pulse bg-gray-50 dark:bg-gray-800/50" />
    </div>

    <div v-else-if="notifications.length === 0"
      class="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
      <NotificationBellIcon class="w-12 h-12 mb-3 opacity-30" />
      <p class="text-base">{{ $t('notification.empty') }}</p>
    </div>

    <div v-else
      class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <NotificationRow v-for="notification in notifications" :key="notification.id" :notification="notification"
          @click="handleRowClick" />
      </div>

      <div v-if="hasMore" class="border-t border-gray-200 dark:border-gray-800 p-4 flex justify-center">
        <button :disabled="isLoading"
          class="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          @click="notificationStore.loadMore()">
          <span v-if="isLoading" class="flex items-center gap-2">
            <Spinner size="sm" />
            {{ $t('notification.loading') }}
          </span>
          <span v-else>{{ $t('notification.loadMore') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Spinner, NotificationBellIcon } from '@hivespace/shared'
import { useNotificationStore } from '@/stores'
import NotificationRow from '@/components/notifications/NotificationRow.vue'

const router = useRouter()
const notificationStore = useNotificationStore()
const { notifications, isLoading, hasMore } = storeToRefs(notificationStore)

const handleRowClick = (id: string) => {
  const notification = notifications.value.find((n) => n.id === id)
  if (notification?.link) router.push(notification.link)
  void notificationStore.markAsRead(id).catch((error) => {
    console.error('Failed to mark notification as read:', error)
  })
}

onMounted(() => {
  notificationStore.fetchNotifications()
})
</script>

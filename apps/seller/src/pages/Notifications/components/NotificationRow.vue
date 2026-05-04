<template>
  <div
    role="button"
    tabindex="0"
    :class="[
      'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5',
      !props.notification.isRead ? 'bg-brand-50/40 dark:bg-brand-900/10' : '',
    ]"
    @click="emit('click', props.notification.id)"
    @keydown.enter.prevent="emit('click', props.notification.id)"
    @keydown.space.prevent="emit('click', props.notification.id)"
  >
    <!-- Avatar -->
    <div class="relative flex-shrink-0">
      <img :src="props.notification.avatarUrl || defaultAvatar" alt=""
        class="h-12 w-12 rounded-full object-cover" />
      <span
        class="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 border-2 border-white dark:border-gray-900">
        <NotificationBellIcon class="h-2.5 w-2.5 text-white" />
      </span>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-snug">{{ props.notification.message }}</p>
      <p :class="['text-xs mt-1', !props.notification.isRead ? 'text-brand-500 font-medium' : 'text-gray-400 dark:text-gray-500']">
        {{ formattedTime }}
      </p>
    </div>

    <span v-if="!props.notification.isRead" class="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-500" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NotificationBellIcon } from '@hivespace/shared'
import { useFormatDate, type InAppNotification } from '@hivespace/shared'

const defaultAvatar =
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='20' fill='%23e5e7eb'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%239ca3af'/%3E%3Cellipse cx='20' cy='34' rx='12' ry='8' fill='%239ca3af'/%3E%3C/svg%3E`

const props = defineProps<{
  notification: InAppNotification
}>()

const emit = defineEmits<{
  (e: 'click', id: string): void
}>()

const { t, locale } = useI18n()
const { formatRelativeTime } = useFormatDate()

const formattedTime = computed(() => {
  return formatRelativeTime(props.notification.createdAt, {
    locale: locale.value,
    t: (key, params) => (params ? t(key, params) : t(key)),
  })
})
</script>

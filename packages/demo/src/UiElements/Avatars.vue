<template>
  <PageBreadcrumb :pageTitle="currentPageTitle" />

  <div class="space-y-5 sm:space-y-6">
    <ComponentCard title="Size Matrix" description="All avatar sizes using the default none status.">
      <div class="flex flex-wrap items-end gap-5">
        <div v-for="size in sizes" :key="size" class="flex flex-col items-center gap-2">
          <Avatar :src="avatarSrc" :size="size" />
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ size }}</span>
        </div>
      </div>
    </ComponentCard>

    <ComponentCard title="Status Variants" description="Every supported status on a medium avatar.">
      <div class="flex flex-wrap items-end gap-5">
        <div v-for="status in statuses" :key="status" class="flex flex-col items-center gap-2">
          <Avatar :src="avatarSrc" size="medium" :status="status" />
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ status }}</span>
        </div>
      </div>
    </ComponentCard>

    <ComponentCard
      title="Fallback States"
      description="Avatars still render meaningful fallbacks without an image source."
    >
      <div class="flex flex-wrap items-end gap-5">
        <div class="flex flex-col items-center gap-2">
          <Avatar size="medium" />
          <span class="text-xs text-gray-500 dark:text-gray-400">default fallback</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Avatar size="large" status="online" />
          <span class="text-xs text-gray-500 dark:text-gray-400">fallback + status</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Avatar size="xxlarge" alt="Fallback user" />
          <span class="text-xs text-gray-500 dark:text-gray-400">custom alt</span>
        </div>
      </div>
    </ComponentCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Avatar, ComponentCard, PageBreadcrumb } from '@hivespace/shared'

const currentPageTitle = ref('Avatars')

const avatarSrc = 'https://placehold.co/150x150'
const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge', 'xxlarge'] as const
const statuses = ['none', 'online', 'offline', 'busy'] as const
</script>

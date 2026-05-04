<template>
  <PageBreadcrumb :pageTitle="currentPageTitle" />

  <div class="space-y-5 sm:space-y-6">
    <ComponentCard
      title="Aspect Ratios"
      description="Every public aspectRatio value supported by the shared YouTube embed."
    >
      <div class="grid gap-6 lg:grid-cols-2">
        <div v-for="aspectRatio in aspectRatios" :key="aspectRatio" class="space-y-3">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ aspectRatio }}</p>
          <YouTubeEmbed
            videoId="dQw4w9WgXcQ"
            :aspectRatio="aspectRatio"
            :title="`Demo video ${aspectRatio}`"
          />
        </div>
      </div>
    </ComponentCard>

    <ComponentCard
      title="Custom Class"
      description="Additional wrapper styling via the className prop."
    >
      <YouTubeEmbed
        videoId="dQw4w9WgXcQ"
        title="Video with custom wrapper class"
        className="overflow-hidden rounded-2xl ring-1 ring-brand-500/20"
      />
    </ComponentCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { ComponentCard, PageBreadcrumb, YouTubeEmbed } from '@hivespace/shared'

const currentPageTitle = ref('Videos')
const aspectRatios = ['16:9', '4:3', '21:9', '1:1'] as const
</script>

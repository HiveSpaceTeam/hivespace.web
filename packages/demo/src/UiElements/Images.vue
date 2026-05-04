<template>
  <PageBreadcrumb :pageTitle="currentPageTitle" />

  <div class="space-y-5 sm:space-y-6">
    <ComponentCard
      title="Responsive Image"
      description="Base image component with explicit alt text."
    >
      <ResponsiveImage src="https://placehold.co/960x420" alt="Shared responsive image example" />
    </ComponentCard>

    <ComponentCard
      title="Image Grid Variants"
      description="Two-column and three-column grid helpers with prop-driven image sets."
    >
      <div class="space-y-6">
        <div class="space-y-3">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">TwoColumnImageGrid</p>
          <TwoColumnImageGrid :images="twoColumnImages" alt="Two column demo image" />
        </div>
        <div class="space-y-3">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
            ThreeColumnImageGrid
          </p>
          <ThreeColumnImageGrid :images="threeColumnImages" alt="Three column demo image" />
        </div>
      </div>
    </ComponentCard>

    <ComponentCard
      title="CountDown Variants"
      description="Prop-driven active and expired countdown states."
    >
      <div class="grid gap-6 md:grid-cols-2">
        <div class="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <p class="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Future date</p>
          <CountDown targetDate="2026-12-20T23:59:59+07:00" />
        </div>
        <div class="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <p class="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Expired state</p>
          <CountDown targetDate="2024-01-01T00:00:00+07:00" expiredLabel="expired" />
        </div>
      </div>
    </ComponentCard>

    <ComponentCard
      title="CommonGridShape"
      description="Decorative background shape used by shared auth and layout surfaces."
    >
      <div class="relative min-h-[220px] overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900">
        <CommonGridShape />
        <div class="relative z-10 p-6">
          <p class="max-w-md text-sm text-gray-600 dark:text-gray-300">
            This component has no props; the demo shows its intended decorative usage inside a
            bounded container.
          </p>
        </div>
      </div>
    </ComponentCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import {
  CommonGridShape,
  ComponentCard,
  CountDown,
  PageBreadcrumb,
  ResponsiveImage,
  ThreeColumnImageGrid,
  TwoColumnImageGrid,
} from '@hivespace/shared'

const currentPageTitle = ref('Images')

const twoColumnImages = [
  'https://placehold.co/640x440',
  'https://placehold.co/640x440/eff6ff/1d4ed8',
]

const threeColumnImages = [
  'https://placehold.co/480x480',
  'https://placehold.co/480x480/fef3c7/b45309',
  'https://placehold.co/480x480/ecfdf5/047857',
]
</script>

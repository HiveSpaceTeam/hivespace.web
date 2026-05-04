<template>
  <PageBreadcrumb :pageTitle="currentPageTitle" />

  <div class="space-y-5 sm:space-y-6">
    <ComponentCard
      title="Shared Component Library"
      description="Prop-complete demo pages for the shared UI components exported from @hivespace/shared."
    >
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-400">
          Start from <code class="rounded bg-blue-100 px-2 py-1 dark:bg-blue-900/30">/demo</code>
          and use the grouped pages below to review variants, states, and emitted events for each
          shared common component.
        </p>
        <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <p class="text-sm text-blue-700 dark:text-blue-300">
            Coverage focus:
            <span class="font-medium">variants, boolean states, v-model behavior, and public events</span>
          </p>
        </div>
      </div>
    </ComponentCard>

    <ComponentCard title="Shared Component Pages">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <router-link
          v-for="item in componentPages"
          :key="item.to"
          :to="item.to"
          class="group rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div class="flex items-center gap-3">
            <div
              :class="[
                'flex h-10 w-10 items-center justify-center rounded-xl text-white',
                item.iconBg,
              ]"
            >
              <component :is="item.icon" class="h-5 w-5" />
            </div>
            <div>
              <h3
                class="font-semibold text-gray-800 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400"
              >
                {{ item.title }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.caption }}</p>
            </div>
          </div>
          <p class="mt-4 text-sm text-gray-600 dark:text-gray-300">{{ item.description }}</p>
        </router-link>
      </div>
    </ComponentCard>

    <ComponentCard title="Legacy Sample Pages">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <router-link
          v-for="item in legacyPages"
          :key="item.to"
          :to="item.to"
          class="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
        >
          <h3 class="font-semibold text-gray-800 dark:text-white">{{ item.title }}</h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">{{ item.description }}</p>
        </router-link>
      </div>
    </ComponentCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { ComponentCard, PageBreadcrumb } from '@hivespace/shared'
import {
  BarChartIcon,
  BoxIcon,
  DocsIcon,
  GridIcon,
  InfoIcon,
  PieChartIcon,
  SuccessIcon,
  TableIcon,
  UserCircleIcon,
  WarningIcon,
} from '@hivespace/shared'

const currentPageTitle = computed(() => 'Component Library')

const componentPages = [
  {
    title: 'Buttons',
    caption: 'Button variants and states',
    description: 'All button variants, icon placements, loading, disabled, and icon-only states.',
    to: '/demo/buttons',
    icon: BoxIcon,
    iconBg: 'bg-blue-500',
  },
  {
    title: 'Badges',
    caption: 'Color, size, and icons',
    description: 'Badge color matrix, both visual variants, sizes, and icon prop coverage.',
    to: '/demo/badge',
    icon: SuccessIcon,
    iconBg: 'bg-indigo-500',
  },
  {
    title: 'Avatars',
    caption: 'Sizes, status, fallback',
    description: 'Avatar sizes, presence states, and no-image fallback behavior.',
    to: '/demo/avatars',
    icon: UserCircleIcon,
    iconBg: 'bg-purple-500',
  },
  {
    title: 'Alerts',
    caption: 'Visual and link variants',
    description: 'All alert variants plus linked and unlinked interaction states.',
    to: '/demo/alerts',
    icon: WarningIcon,
    iconBg: 'bg-orange-500',
  },
  {
    title: 'Forms',
    caption: 'Inputs and picker components',
    description: 'Input, select, textarea, choice controls, date/time pickers, files, and quantity.',
    to: '/demo/form-elements',
    icon: DocsIcon,
    iconBg: 'bg-emerald-500',
  },
  {
    title: 'Navigation',
    caption: 'Actions and navigation',
    description: 'Link, tabs, dropdown, pagination, chips, theme toggler, and click-outside.',
    to: '/demo/navigation-actions',
    icon: GridIcon,
    iconBg: 'bg-cyan-500',
  },
  {
    title: 'Feedback',
    caption: 'Toast and loading states',
    description: 'Spinner, fullscreen loader, direct toasts, toast container, and preview toasts.',
    to: '/demo/toast',
    icon: InfoIcon,
    iconBg: 'bg-green-500',
  },
  {
    title: 'Modals',
    caption: 'Modal primitives and variants',
    description: 'Raw modal usage plus confirm modal variants, sizes, loading, and third actions.',
    to: '/demo/modal',
    icon: TableIcon,
    iconBg: 'bg-rose-500',
  },
  {
    title: 'Images',
    caption: 'Media helpers and layout',
    description: 'Responsive image, image grids, countdown states, and decorative shared shapes.',
    to: '/demo/images',
    icon: PieChartIcon,
    iconBg: 'bg-pink-500',
  },
  {
    title: 'Videos',
    caption: 'YouTube embed variants',
    description: 'All supported aspect ratios plus custom wrapper class usage.',
    to: '/demo/videos',
    icon: BarChartIcon,
    iconBg: 'bg-violet-500',
  },
]

const legacyPages = [
  {
    title: 'Ecommerce Dashboard',
    description: 'Legacy sample dashboard that incidentally exercises tabs, dropdowns, and buttons.',
    to: '/demo/ecommerce-dashboard',
  },
  {
    title: 'Basic Tables',
    description: 'Legacy table sample outside the common-component coverage set.',
    to: '/demo/basic-tables',
  },
  {
    title: 'Charts',
    description: 'Legacy chart samples for line and bar chart components.',
    to: '/demo/line-chart',
  },
  {
    title: 'Calendar',
    description: 'Feature demo using the shared modal system in a more realistic flow.',
    to: '/demo/calendar',
  },
  {
    title: 'Profile',
    description: 'Feature sample showing profile cards and popup editing interactions.',
    to: '/demo/profile',
  },
  {
    title: 'Blank Page',
    description: 'Minimal route placeholder retained for layout checks.',
    to: '/demo/blank',
  },
]
</script>

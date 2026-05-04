<template>
  <PageBreadcrumb :pageTitle="currentPageTitle" />

  <div class="space-y-5 sm:space-y-6">
    <ComponentCard
      title="Link Variants"
      description="Internal links emit click events, while external links behave like standard anchors."
    >
      <div class="flex flex-wrap items-center gap-4">
        <Link
          to="/demo/buttons"
          class="text-sm font-medium text-brand-500 underline"
          @click="lastLinkTarget = '/demo/buttons'"
        >
          Internal demo link
        </Link>
        <Link
          to="https://example.com"
          external
          class="text-sm font-medium text-blue-600 underline"
        >
          External link
        </Link>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          last internal click: {{ lastLinkTarget || 'none' }}
        </span>
      </div>
    </ComponentCard>

    <ComponentCard
      title="Tabs And FilterChips"
      description="Both tab variants plus the chip-based filter selector."
    >
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <Tabs v-model="selectedTab" :options="tabOptions" />
          <Tabs v-model="selectedTabPills" :options="tabOptions" variant="pills" />
        </div>
        <div class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <FilterChips v-model="selectedChip" :options="chipOptions" />
          <p class="text-sm text-gray-500 dark:text-gray-400">active chip: {{ selectedChip }}</p>
        </div>
      </div>
    </ComponentCard>

    <ComponentCard
      title="DropdownMenu"
      description="Teleport on and off, plus navigation and custom trigger slots."
    >
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Teleport on</span>
            <DropdownMenu :menu-items="menuItems" @navigate="lastDropdownEvent = $event" />
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">last event: {{ lastDropdownEvent }}</p>
        </div>

        <div class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Teleport off</span>
            <DropdownMenu
              :menu-items="menuItems"
              :useTeleport="false"
              buttonClass="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300"
              @navigate="lastDropdownEvent = $event"
            >
              <template #icon="{ open }">
                <span class="text-sm">{{ open ? 'Close' : 'Open' }}</span>
              </template>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </ComponentCard>

    <ComponentCard
      title="Pagination"
      description="Interactive page and page-size state using the shared pagination component."
    >
      <div class="space-y-4">
        <Pagination
          :currentPage="pagination.currentPage"
          :pageSize="pagination.pageSize"
          :totalPages="pagination.totalPages"
          :totalItems="pagination.totalItems"
          :pageSizeOptions="[10, 20, 50]"
          @update:currentPage="pagination.currentPage = $event"
          @update:pageSize="pagination.pageSize = $event"
        />
        <p class="text-sm text-gray-500 dark:text-gray-400">
          page {{ pagination.currentPage }} / {{ pagination.totalPages }},
          size {{ pagination.pageSize }}
        </p>
      </div>
    </ComponentCard>

    <ComponentCard
      title="ThemeToggler And v-click-outside"
      description="Theme toggling and outside-click behavior from the shared exports."
    >
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <ThemeToggler defaultTheme="light" @themeChanged="lastTheme = $event" />
          <p class="text-sm text-gray-500 dark:text-gray-400">last theme: {{ lastTheme }}</p>
        </div>

        <div class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <Button variant="outline" :onClick="toggleOutsidePanel">
            {{ outsidePanelOpen ? 'Close' : 'Open' }} outside-click panel
          </Button>
          <div
            v-if="outsidePanelOpen"
            v-click-outside="handleOutsideClick"
            class="rounded-xl border border-dashed border-brand-400 bg-brand-50 p-4 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
          >
            Click anywhere outside this panel.
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            outside clicks handled: {{ outsideClickCount }}
          </p>
        </div>
      </div>
    </ComponentCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

import {
  Button,
  ComponentCard,
  DropdownMenu,
  FilterChips,
  Link,
  PageBreadcrumb,
  Pagination,
  Tabs,
  ThemeToggler,
  VClickOutside as vClickOutside,
} from '@hivespace/shared'

const currentPageTitle = ref('Navigation And Actions')
const lastLinkTarget = ref('')
const lastDropdownEvent = ref('')
const lastTheme = ref('light')
const selectedTab = ref('overview')
const selectedTabPills = ref('monthly')
const selectedChip = ref('all')
const outsidePanelOpen = ref(false)
const outsideClickCount = ref(0)

const tabOptions = [
  { value: 'overview', label: 'Overview' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'activity', label: 'Activity' },
]

const chipOptions = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
]

const menuItems = [
  { label: 'Go to buttons', to: '/demo/buttons' },
  { label: 'Run action', onClick: () => (lastDropdownEvent.value = 'action clicked') },
]

const pagination = reactive({
  currentPage: 3,
  totalPages: 12,
  pageSize: 20,
  totalItems: 240,
})

const toggleOutsidePanel = () => {
  outsidePanelOpen.value = !outsidePanelOpen.value
}

const handleOutsideClick = () => {
  outsidePanelOpen.value = false
  outsideClickCount.value += 1
}
</script>

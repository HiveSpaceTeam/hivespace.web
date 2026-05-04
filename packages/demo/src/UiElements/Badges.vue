<template>
  <PageBreadcrumb :pageTitle="currentPageTitle" />

  <div class="space-y-5 sm:space-y-6">
    <ComponentCard
      title="Variant And Size Matrix"
      description="All badge colors in light and solid variants, with both supported sizes."
    >
      <div class="space-y-6">
        <div v-for="variant in variants" :key="variant" class="space-y-3">
          <p class="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
            {{ variant }}
          </p>
          <div class="space-y-3">
            <div v-for="size in sizes" :key="`${variant}-${size}`" class="flex flex-wrap gap-3">
              <Badge
                v-for="color in colors"
                :key="`${variant}-${size}-${color}`"
                :variant="variant"
                :size="size"
                :color="color"
              >
                {{ color }} {{ size }}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </ComponentCard>

    <ComponentCard
      title="Icon Variants"
      description="Separate start and end icon examples for the public icon props."
    >
      <div class="grid gap-4 md:grid-cols-2">
        <div class="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <p class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Start icon</p>
          <div class="flex flex-wrap gap-3">
            <Badge
              v-for="color in colors"
              :key="`start-${color}`"
              :color="color"
              :variant="color === 'dark' ? 'solid' : 'light'"
              :startIcon="PlusIcon"
            >
              {{ color }}
            </Badge>
          </div>
        </div>

        <div class="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <p class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">End icon</p>
          <div class="flex flex-wrap gap-3">
            <Badge
              v-for="color in colors"
              :key="`end-${color}`"
              :color="color"
              variant="solid"
              :endIcon="CheckIcon"
            >
              {{ color }}
            </Badge>
          </div>
        </div>
      </div>
    </ComponentCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Badge, ComponentCard, PageBreadcrumb } from '@hivespace/shared'
import { CheckIcon, PlusIcon } from '@hivespace/shared'

const currentPageTitle = ref('Badges')

const colors = ['primary', 'success', 'error', 'warning', 'info', 'light', 'dark'] as const
const variants = ['light', 'solid'] as const
const sizes = ['sm', 'md'] as const
</script>

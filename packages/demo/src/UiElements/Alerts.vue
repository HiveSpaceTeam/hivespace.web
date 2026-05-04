<template>
  <PageBreadcrumb :pageTitle="currentPageTitle" />

  <div class="space-y-5 sm:space-y-6">
    <ComponentCard
      title="Alert Variants"
      description="Each alert variant shown with and without its optional link."
    >
      <div class="grid gap-4 lg:grid-cols-2">
        <div
          v-for="variant in variants"
          :key="variant"
          class="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800"
        >
          <Alert
            :variant="variant"
            :title="`${variant} alert with link`"
            message="This example emits navigation when the inline link is clicked."
            :showLink="true"
            linkHref="/demo/navigation-actions"
            linkText="Open navigation demos"
            @navigate="lastNavigation = $event"
          />
          <Alert
            :variant="variant"
            :title="`${variant} alert`"
            message="This variant only renders title and message content."
            :showLink="false"
          />
        </div>
      </div>
    </ComponentCard>

    <ComponentCard title="Interaction Log" description="Demonstrates the public navigate event.">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Last alert navigation target:
        <span class="font-medium text-gray-900 dark:text-white">{{ lastNavigation || 'none' }}</span>
      </p>
    </ComponentCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Alert, ComponentCard, PageBreadcrumb } from '@hivespace/shared'

const currentPageTitle = ref('Alerts')
const lastNavigation = ref('')
const variants = ['success', 'warning', 'error', 'info'] as const
</script>

<template>
  <PageBreadcrumb :pageTitle="currentPageTitle" />

  <div class="space-y-5 sm:space-y-6">
    <ComponentCard
      title="Variant Matrix"
      description="Every button variant in both supported sizes."
    >
      <div class="grid gap-4 md:grid-cols-2">
        <div
          v-for="variant in variants"
          :key="variant"
          class="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
        >
          <p class="mb-3 text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
            {{ variant }}
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <Button :variant="variant" size="sm">{{ variant }} sm</Button>
            <Button :variant="variant" size="md">{{ variant }} md</Button>
          </div>
        </div>
      </div>
    </ComponentCard>

    <ComponentCard
      title="Icons And States"
      description="Loading, disabled, icon placement, and icon-only states."
    >
      <div class="grid gap-4 md:grid-cols-2">
        <div class="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <p class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Icon placement</p>
          <div class="flex flex-wrap items-center gap-3">
            <Button variant="primary" :startIcon="BoxIcon">Start icon</Button>
            <Button variant="secondary" :endIcon="BoxIcon">End icon</Button>
            <Button variant="success" :startIcon="CheckIcon" :endIcon="BoxIcon">
              Both icons
            </Button>
          </div>
        </div>

        <div class="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <p class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">State variants</p>
          <div class="flex flex-wrap items-center gap-3">
            <Button variant="outline" disabled>Disabled</Button>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="danger" size="sm" loading>Loading small</Button>
          </div>
        </div>

        <div class="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <p class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Icon only</p>
          <div class="flex flex-wrap items-center gap-3">
            <Button variant="primary" iconOnly>
              <template #icon>
                <PlusIcon />
              </template>
            </Button>
            <Button variant="outline" size="sm" iconOnly>
              <template #icon>
                <BoxIcon />
              </template>
            </Button>
            <Button variant="primary-outline" iconOnly>
              <template #icon>
                <CheckIcon />
              </template>
            </Button>
          </div>
        </div>

        <div class="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <p class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Button types in a form
          </p>
          <form class="flex flex-wrap items-center gap-3" @submit.prevent="submitCount += 1">
            <Button type="submit" variant="primary">Submit</Button>
            <Button type="reset" variant="outline" :onClick="resetForm">Reset</Button>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              submits: {{ submitCount }} | value: {{ formValue || 'empty' }}
            </span>
            <input
              v-model="formValue"
              class="h-10 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700"
              placeholder="Type here"
            />
          </form>
        </div>
      </div>
    </ComponentCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button, ComponentCard, PageBreadcrumb } from '@hivespace/shared'
import { BoxIcon, CheckIcon, PlusIcon } from '@hivespace/shared'

const currentPageTitle = ref('Buttons')
const submitCount = ref(0)
const formValue = ref('')

const variants = [
  'primary',
  'secondary',
  'danger',
  'warning',
  'success',
  'outline',
  'primary-outline',
] as const

const resetForm = () => {
  formValue.value = ''
}
</script>

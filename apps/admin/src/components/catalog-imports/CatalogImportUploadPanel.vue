<template>
  <section class="grid gap-5 lg:grid-cols-2">
    <form
      class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
      @submit.prevent="emit('submitCategory')"
    >
      <h2 class="text-base font-semibold text-gray-900 dark:text-white">
        {{ $t('catalogImports.sections.categoryProvisioning') }}
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        {{ $t('catalogImports.categories.provisioningDescription') }}
      </p>
      <label class="mt-4 block" for="catalogImportCategoryFile">
        <span class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ $t('catalogImports.upload.categoryLabel') }}
        </span>
        <input
          id="catalogImportCategoryFile"
          type="file"
          accept="application/json,.json"
          class="block h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:file:bg-gray-800 dark:file:text-gray-200"
          @change="event => emit('categoryFileChange', event)"
        />
      </label>
      <Button
        className="mt-4"
        type="submit"
        variant="primary"
        size="sm"
        :disabled="!hasCategoryFile || disabled"
        :loading="categoryLoading"
      >
        {{ $t('catalogImports.actions.provisionCategories') }}
      </Button>
      <p v-if="categoryError" class="mt-3 text-sm text-error-500">
        {{ categoryError }}
      </p>
    </form>

    <form
      class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
      @submit.prevent="emit('submitBundle')"
    >
      <h2 class="text-base font-semibold text-gray-900 dark:text-white">
        {{ $t('catalogImports.sections.bundleSubmission') }}
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        {{ $t('catalogImports.upload.bundleDescription') }}
      </p>
      <label class="mt-4 block" for="catalogImportBundleFile">
        <span class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ $t('catalogImports.upload.bundleLabel') }}
        </span>
        <input
          id="catalogImportBundleFile"
          type="file"
          accept="application/json,.json"
          class="block h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:file:bg-gray-800 dark:file:text-gray-200"
          @change="event => emit('bundleFileChange', event)"
        />
      </label>
      <Button
        className="mt-4"
        type="submit"
        variant="primary"
        size="sm"
        :disabled="!hasBundleFile || disabled"
        :loading="bundleLoading"
      >
        {{ $t('catalogImports.upload.bundleAction') }}
      </Button>
      <p v-if="bundleError" class="mt-3 text-sm text-error-500">
        {{ bundleError }}
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@hivespace/shared'

defineProps<{
  hasCategoryFile: boolean
  hasBundleFile: boolean
  disabled?: boolean
  categoryLoading?: boolean
  bundleLoading?: boolean
  categoryError?: string | null
  bundleError?: string | null
}>()

const emit = defineEmits<{
  categoryFileChange: [event: Event]
  bundleFileChange: [event: Event]
  submitCategory: []
  submitBundle: []
}>()
</script>

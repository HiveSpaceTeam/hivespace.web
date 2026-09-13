<template>
  <div class="-mx-6 -mb-6">
    <div class="space-y-3 px-5 pb-5">
      <div
        v-if="productName"
        class="rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-white/[0.04] dark:text-gray-300"
      >
        <p class="font-medium text-gray-900 dark:text-white">
          {{ t('catalogImports.mapping.productName') }}
        </p>
        <p class="mt-1">{{ productName }}</p>
      </div>

      <div class="rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-white/[0.04] dark:text-gray-300">
        <p class="font-medium text-gray-900 dark:text-white">
          {{ t('catalogImports.mapping.externalProductId') }}
        </p>
        <p class="mt-1">{{ externalProductId }}</p>
      </div>

      <div
        v-if="singleExternalCategoryId"
        class="rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-white/[0.04] dark:text-gray-300"
      >
        <p class="font-medium text-gray-900 dark:text-white">
          {{ t('catalogImports.categories.externalId') }}
        </p>
        <p class="mt-1">{{ singleExternalCategoryId }}</p>
      </div>

      <Select
        v-else-if="externalCategoryOptions.length > 0"
        v-model="selectedExternalCategoryId"
        :label="t('catalogImports.mapping.externalCategoryLabel')"
        :placeholder="t('catalogImports.mapping.externalCategoryPlaceholder')"
        :options="externalCategoryOptions"
      />

      <p v-else class="rounded-lg bg-warning-50 p-3 text-sm text-warning-700 dark:bg-warning-500/10 dark:text-warning-300">
        {{ t('catalogImports.mapping.productCategoryMissing') }}
      </p>

      <Input
        v-model="searchTerm"
        type="search"
        :label="t('catalogImports.mapping.searchLabel')"
        :placeholder="t('catalogImports.mapping.searchPlaceholder')"
      />

      <Select
        v-model="selectedCategoryId"
        :label="t('catalogImports.mapping.categoryLabel')"
        :placeholder="t('catalogImports.mapping.categoryPlaceholder')"
        :options="categoryOptions"
        :noOptionsText="t('catalogImports.mapping.noCategories')"
      />

      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ t('catalogImports.mapping.revalidationHint') }}
      </p>
      <p v-if="error" class="text-sm text-error-500">{{ error }}</p>
    </div>

    <div class="flex justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-800">
      <Button type="button" variant="outline" size="sm" :onClick="() => closeModal(null)">
        {{ t('catalogImports.actions.cancel') }}
      </Button>
      <Button type="button" size="sm" :disabled="isSubmitDisabled" :onClick="handleSubmit">
        {{ t('catalogImports.actions.mapCategory') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button, Input, Select, useModal } from '@hivespace/shared'
import { useI18n } from 'vue-i18n'
import type { CatalogCategoryOption } from '@/types'

const props = defineProps<{
  externalProductId: string
  productName?: string | null
  externalCategoryIds: string[]
  categories: CatalogCategoryOption[]
}>()

const { t } = useI18n()
const { closeModal } = useModal()
const searchTerm = ref('')
const selectedCategoryId = ref<number | string | null>(null)
const selectedExternalCategoryId = ref<string | null>(
  props.externalCategoryIds.length === 1 ? props.externalCategoryIds[0] : null,
)
const error = ref<string | null>(null)

const normalizedSearchTerm = computed(() => searchTerm.value.trim().toLowerCase())
const singleExternalCategoryId = computed(() =>
  props.externalCategoryIds.length === 1 ? props.externalCategoryIds[0] : null,
)
const externalCategoryOptions = computed(() =>
  props.externalCategoryIds.map(categoryId => ({
    value: categoryId,
    label: categoryId,
  })),
)
const categoryOptions = computed(() =>
  props.categories
    .filter(category => {
      if (!normalizedSearchTerm.value) return true

      return [category.name, category.displayName, String(category.id)].some(value =>
        value.toLowerCase().includes(normalizedSearchTerm.value),
      )
    })
    .map(category => ({
      value: category.id,
      label: `${category.displayName || category.name} (#${category.id})`,
    })),
)
const selectedMappingExternalCategoryId = computed(
  () => singleExternalCategoryId.value ?? selectedExternalCategoryId.value,
)
const isSubmitDisabled = computed(() => !selectedMappingExternalCategoryId.value)

const handleSubmit = () => {
  if (!selectedMappingExternalCategoryId.value) {
    error.value = t('catalogImports.mapping.externalCategoryRequired')
    return
  }

  const categoryId = Number(selectedCategoryId.value)
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    error.value = t('catalogImports.mapping.categoryRequired')
    return
  }

  closeModal<{ hiveSpaceCategoryId: number; externalCategoryId: string }>({
    hiveSpaceCategoryId: categoryId,
    externalCategoryId: selectedMappingExternalCategoryId.value,
  })
}
</script>

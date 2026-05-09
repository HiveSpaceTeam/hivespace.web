<template>
  <div class="bg-white dark:bg-card-dark mt-4 shadow-sm relative group overflow-hidden">
    <div class="container mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100 uppercase">{{ $t('storefront.categories') }}</h2>
      </div>

      <div class="grid grid-cols-9 gap-y-6">
        <a
          href="#"
          v-for="category in categories"
          :key="category.id"
          class="flex flex-col items-center group cursor-pointer border-r border-b border-gray-100 dark:border-gray-800 py-4 hover:shadow-md transition-shadow"
        >
          <div class="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 group-hover:-translate-y-1 transition-transform overflow-hidden">
            <img :src="category.imageUrl ?? ''" :alt="category.name" class="w-full h-full object-cover" />
          </div>
          <span class="text-xs text-center text-gray-700 dark:text-gray-300 leading-tight px-1">{{ category.name }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '@/stores'

const categoryStore = useCategoryStore()
const { categories } = storeToRefs(categoryStore)

onMounted(() => categoryStore.fetchCategories())
</script>

import { defineStore } from 'pinia'
import { categoryService } from '@/services/category.service'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { HomepageCategory } from '@/types'
import { ref } from 'vue'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<HomepageCategory[]>([])
  const { isLoading, run } = useAsyncAction()

  const fetchCategories = async () => {
    categories.value = await run(() => categoryService.getHomepageCategories())
  }

  return { categories, isLoading, fetchCategories }
})

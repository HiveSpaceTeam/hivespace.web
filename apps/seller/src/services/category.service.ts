import type { Category, CategoryAttribute } from '@/types'
import { apiService } from './api'
import { buildApiUrl } from '@/config'

const CATEGORY_ENDPOINTS = {
  CATEGORIES: '/categories',
} as const

class CategoryService {
  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    const url = buildApiUrl(CATEGORY_ENDPOINTS.CATEGORIES)
    const response = await apiService.get<Category[]>(url)
    return response
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category> {
    const url = buildApiUrl(`${CATEGORY_ENDPOINTS.CATEGORIES}/${id}`)
    return await apiService.get<Category>(url)
  }

  /**
   * Get category attributes by category ID
   */
  async getCategoryAttributes(categoryId: string): Promise<CategoryAttribute[]> {
    const url = buildApiUrl(`${CATEGORY_ENDPOINTS.CATEGORIES}/${categoryId}/attributes`)
    const response = await apiService.get<CategoryAttribute[]>(url)
    return response
  }
}

export const categoryService = new CategoryService()

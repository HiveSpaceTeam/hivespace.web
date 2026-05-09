import type { Category, CategoryAttribute } from '@/types'
import { BaseService } from './base.service'

class CategoryService extends BaseService {
  async getCategories(): Promise<Category[]> {
    return this.get<Category[]>('/categories')
  }

  async getCategoryById(id: string): Promise<Category> {
    return this.get<Category>(`/categories/${id}`)
  }

  async getCategoryAttributes(categoryId: string): Promise<CategoryAttribute[]> {
    return this.get<CategoryAttribute[]>(`/categories/${categoryId}/attributes`)
  }
}

export const categoryService = new CategoryService()

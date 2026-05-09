import { BaseService } from './base.service'
import type { HomepageCategory } from '@/types'

class CategoryService extends BaseService {
  getHomepageCategories(): Promise<HomepageCategory[]> {
    return this.get<HomepageCategory[]>('/categories/homepage')
  }
}

export const categoryService = new CategoryService()

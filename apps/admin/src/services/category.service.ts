import type { CatalogCategoryOption } from '@/types'
import { BaseService } from './base.service'

class CategoryService extends BaseService {
  getCategories(): Promise<CatalogCategoryOption[]> {
    return this.get<CatalogCategoryOption[]>('/categories')
  }
}

export const categoryService = new CategoryService()

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { useCategoryStore } from './category.store'
import { categoryService } from '@/services/category.service'
import type { HomepageCategory } from '@/types'

jest.mock('@/services/category.service', () => ({
  categoryService: {
    getHomepageCategories: jest.fn(),
  },
}))

const fakeCategories = (): HomepageCategory[] => [
  { id: 1, name: 'Electronics', displayName: 'Electronics', imageFileId: null, imageUrl: '/electronics.png' },
  { id: 2, name: 'Fashion', displayName: 'Fashion', imageFileId: null, imageUrl: '/fashion.png' },
]

describe('useCategoryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(categoryService.getHomepageCategories).mockResolvedValue(fakeCategories())
  })

  it('should load categories from the API', async () => {
    const store = useCategoryStore()

    await store.fetchCategories()

    expect(categoryService.getHomepageCategories).toHaveBeenCalled()
    expect(store.categories).toHaveLength(2)
  })

  it('should populate categories in store after fetch', async () => {
    const store = useCategoryStore()

    await store.fetchCategories()

    expect(store.categories[0]?.name).toBe('Electronics')
    expect(store.categories[1]?.name).toBe('Fashion')
  })
})

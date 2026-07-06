import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { useProductStore } from './product.store'
import { categoryService } from '@/services/category.service'
import { configurationService } from '@/services/configuration.service'
import { productService } from '@/services/product.service'

jest.mock('@/services/product.service', () => ({
  productService: {
    createProduct: jest.fn(),
    deleteProduct: jest.fn(),
    getProductById: jest.fn(),
    getProducts: jest.fn(),
    updateProduct: jest.fn(),
  },
}))

jest.mock('@/services/category.service', () => ({
  categoryService: {
    getCategories: jest.fn(),
    getCategoryAttributes: jest.fn(),
  },
}))

jest.mock('@/services/configuration.service', () => ({
  configurationService: {
    getCurrencyConfig: jest.fn(),
  },
}))

describe('useProductStore (seller)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(productService.getProducts).mockResolvedValue({
      items: [
        {
          id: 10,
          name: 'Honey Jar',
          category: 'Food',
          description: 'Pure honey',
          variants: [],
          skus: [
            {
              id: 100,
              skuVariants: [],
              price: {
                amount: 1_050,
                currencyCode: null,
                currency: 'USD',
              },
              quantity: 10,
              skuNo: 'SKU-001',
            },
          ],
          thumbnailUrl: '/honey.png',
          currentSeller: null,
        },
      ],
      pagination: {
        currentPage: 1,
        pageSize: 20,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    })
    jest.mocked(productService.getProductById).mockResolvedValue({
      id: 10,
      name: 'Honey Jar',
      category: 'Food',
      description: 'Pure honey',
      variants: [],
      skus: [
        {
          id: 100,
          skuVariants: [],
          price: {
            amount: 2_500,
            currencyCode: null,
            currency: 'EUR',
          },
          quantity: 10,
          skuNo: 'SKU-001',
        },
      ],
      thumbnailUrl: '/honey.png',
      currentSeller: null,
    })
    jest.mocked(configurationService.getCurrencyConfig).mockResolvedValue({
      defaultCurrencyCode: 'USD',
      version: 4,
      items: [
        { currencyCode: 'VND', enabled: false },
        { currencyCode: 'USD', enabled: true },
        { currencyCode: 'EUR', enabled: true },
      ],
    })
    jest.mocked(categoryService.getCategories).mockResolvedValue([])
    jest.mocked(categoryService.getCategoryAttributes).mockResolvedValue([])
  })

  it('should normalize legacy sku currencies in the product list', async () => {
    const store = useProductStore()

    await store.fetchProducts({ page: 1, pageSize: 20 })

    expect(store.products[0]?.skus[0]?.price.currencyCode).toBe('USD')
  })

  it('should normalize legacy sku currencies in product detail', async () => {
    const store = useProductStore()

    await store.fetchProductById('10')

    expect(store.currentProduct?.skus[0]?.price.currencyCode).toBe('EUR')
  })

  it('should load enabled currency options from configuration', async () => {
    const store = useProductStore()

    const config = await store.fetchCurrencyConfig()

    expect(configurationService.getCurrencyConfig).toHaveBeenCalled()
    expect(config.defaultCurrencyCode).toBe('USD')
    expect(store.currencyOptions).toEqual([
      { label: 'USD', value: 'USD' },
      { label: 'EUR', value: 'EUR' },
    ])
  })
})

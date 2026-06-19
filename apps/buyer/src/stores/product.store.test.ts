import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { productService } from '@/services/product.service'
import { useProductStore } from './product.store'

jest.mock('@/services/product.service', () => ({
  productService: {
    getProducts: jest.fn(),
    getProductById: jest.fn(),
  },
}))

describe('useProductStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(productService.getProducts).mockResolvedValue({
      items: [
        {
          id: '10',
          name: 'Honey Jar',
          price: 100_000,
          productImage: '/honey.png',
          soldCount: 5,
          rating: 4.8,
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
      variants: [{ id: 'variant-001', name: 'Size', options: [{ value: 'M' }] }],
      skus: [
        {
          id: 100,
          skuVariants: [{ variantName: 'Size', value: 'M' }],
          price: { amount: 100_000, currency: 704 },
          quantity: 10,
        },
      ],
      images: [],
      attributes: [],
      thumbnailUrl: '/honey.png',
      currentSeller: { id: 'seller-001', storeName: 'Hive Store', logoUrl: null },
    })
  })

  it('should load storefront product summaries', async () => {
    const store = useProductStore()

    await store.fetchHomeProducts({ page: 1, pageSize: 20 })

    expect(productService.getProducts).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
    expect(store.homeProducts[0]?.name).toBe('Honey Jar')
  })

  it('should load product detail with title price and variants', async () => {
    const store = useProductStore()

    await store.fetchProductDetail('10')

    expect(productService.getProductById).toHaveBeenCalledWith('10')
    expect(store.productDetail.name).toBe('Honey Jar')
    expect(store.productDetail.skus[0]?.price.amount).toBe(100_000)
    expect(store.productDetail.variants[0]?.name).toBe('Size')
  })
})

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
          price: {
            amount: 100_000,
            currencyCode: 'VND',
            isValid: true,
            issueCode: null,
          },
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
      description: 'Pure honey',
      variants: [],
      skus: [
        {
          id: 100,
          skuNo: 'SKU-001',
          skuName: 'Honey Jar',
          price: { amount: 100_000, currency: 704 },
          quantity: 10,
          isActive: true,
          images: [],
          attributes: '',
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
    expect(store.homeProducts[0]?.price).toBe(100_000)
    expect(store.homeProducts[0]?.priceCurrencyCode).toBe('VND')
    expect(store.homeProducts[0]?.priceIssue).toBeNull()
  })

  it('should load product detail with title and price', async () => {
    const store = useProductStore()

    await store.fetchProductDetail('10')

    expect(productService.getProductById).toHaveBeenCalledWith('10')
    expect(store.productDetail.name).toBe('Honey Jar')
    expect(store.productDetail.skus[0]?.price.amount).toBe(100_000)
    expect(store.productDetail.skus[0]?.skuNo).toBe('SKU-001')
  })
})

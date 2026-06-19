import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { useProductStore } from './product.store'
import { productService } from '@/services/product.service'
import { categoryService } from '@/services/category.service'
import type { CategoryAttribute, GetProductListResponse, Product } from '@/types'

jest.mock('@/services/product.service', () => ({
  productService: {
    getProducts: jest.fn(),
    getProductById: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
  },
}))

jest.mock('@/services/category.service', () => ({
  categoryService: {
    getCategories: jest.fn(),
    getCategoryAttributes: jest.fn(),
  },
}))

const productListResponse = (count = 1): GetProductListResponse => ({
  items: Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    category: 'Electronics',
    variants: [],
    skus: [],
    thumbnailUrl: null,
    currentSeller: null,
  })),
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: count,
    totalPages: Math.ceil(count / 10),
    hasNextPage: false,
    hasPreviousPage: false,
  },
})

const categoryAttributes: CategoryAttribute[] = [
  {
    id: 'attr-1',
    name: 'Size',
    valueType: 1,
    inputType: 2,
    isMandatory: true,
    maxValueCount: 1,
    isActive: true,
    createdAt: '2026-06-13T00:00:00Z',
    updatedAt: null,
    values: [],
  },
]

const productDetail: Product = {
  id: 1,
  name: 'Honey Jar',
  category: 'Food',
  description: 'Natural honey',
  variants: [],
  skus: [],
  thumbnailUrl: null,
  currentSeller: null,
}

describe('useProductStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
    jest.mocked(productService.getProducts).mockResolvedValue(productListResponse())
    jest.mocked(productService.getProductById).mockResolvedValue(productDetail)
    jest.mocked(productService.createProduct).mockResolvedValue({
      id: 'new-product-001',
      name: 'New Product',
      category: 'Electronics',
      productVariants: [],
      productSkus: [],
      createdAt: '2026-06-13T00:00:00Z',
      thumbnailUrl: null,
      currentSeller: null,
    })
    jest.mocked(productService.updateProduct).mockResolvedValue(undefined)
    jest.mocked(productService.deleteProduct).mockResolvedValue(undefined)
    jest.mocked(categoryService.getCategories).mockResolvedValue([
      {
        id: 'cat-1',
        name: 'Electronics',
        displayName: 'Electronics',
        imageFileId: null,
        imageUrl: null,
      },
    ])
    jest.mocked(categoryService.getCategoryAttributes).mockResolvedValue(categoryAttributes)
  })

  it('should fetch products from the seller API', async () => {
    const store = useProductStore()

    await store.fetchProducts({ page: 1, pageSize: 10 })

    expect(productService.getProducts).toHaveBeenCalledWith({ page: 1, pageSize: 10 })
    expect(store.products).toHaveLength(1)
    expect(store.pagination?.totalItems).toBe(1)
  })

  it('should fetch categories and store them locally', async () => {
    const store = useProductStore()

    const result = await store.fetchCategories()

    expect(categoryService.getCategories).toHaveBeenCalled()
    expect(result).toHaveLength(1)
    expect(store.categories[0]?.id).toBe('cat-1')
  })

  it('should fetch category attributes and store them locally', async () => {
    const store = useProductStore()

    const result = await store.fetchCategoryAttributes('cat-1')

    expect(categoryService.getCategoryAttributes).toHaveBeenCalledWith('cat-1')
    expect(result).toEqual(categoryAttributes)
    expect(store.categoryAttributes).toEqual(categoryAttributes)
  })

  it('should clear category attributes without touching categories', async () => {
    const store = useProductStore()
    await store.fetchCategoryAttributes('cat-1')

    store.clearCategoryAttributes()

    expect(store.categoryAttributes).toEqual([])
    expect(store.categories).toEqual([])
  })

  it('should fetch a product by id and store it as currentProduct', async () => {
    const store = useProductStore()

    const result = await store.fetchProductById('1')

    expect(productService.getProductById).toHaveBeenCalledWith('1')
    expect(result).toEqual(productDetail)
    expect(store.currentProduct).toEqual(productDetail)
  })

  it('should create a product', async () => {
    const store = useProductStore()

    const result = await store.createProduct({
      name: 'New Product',
      category: 'Electronics',
      variants: [],
      skus: [],
    })

    expect(productService.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Product' }),
    )
    expect(result.name).toBe('New Product')
  })

  it('should update a product', async () => {
    const store = useProductStore()

    await store.updateProduct('1', {
      name: 'Updated Product',
      category: 'Electronics',
      variants: [],
      skus: [],
    })

    expect(productService.updateProduct).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ name: 'Updated Product' }),
    )
  })

  it('should delete a product and decrement pagination totals', async () => {
    jest.mocked(productService.getProducts).mockResolvedValue(productListResponse(2))
    const store = useProductStore()
    await store.fetchProducts({ page: 1, pageSize: 10 })

    await store.deleteProduct('1')

    expect(productService.deleteProduct).toHaveBeenCalledWith('1')
    expect(store.products).toHaveLength(1)
    expect(store.pagination?.totalItems).toBe(1)
  })
})

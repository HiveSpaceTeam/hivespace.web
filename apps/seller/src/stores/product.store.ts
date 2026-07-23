import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  normalizeCurrencyCode,
  type PlatformCurrencyConfig,
  type PlatformCurrencyConfigItem,
  type SupportedCurrencyCode,
} from '@hivespace/shared'
import type {
  Category,
  CategoryAttribute,
  CreateProductRequest,
  CreateProductResponse,
  GetProductListQuery,
  GetProductListResponse,
  Product,
  UpdateProductRequest,
} from '@/types'
import type { PaginationMetadata } from '@hivespace/shared'
import { categoryService } from '@/services/category.service'
import { configurationService } from '@/services/configuration.service'
import { productService } from '@/services/product.service'

const normalizeProduct = (product: Product): Product => ({
  ...product,
  skus: product.skus.map((sku) => ({
    ...sku,
    price: {
      ...sku.price,
      currencyCode: normalizeCurrencyCode(sku.price?.currencyCode ?? sku.price?.currency),
    },
  })),
})

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const pagination = ref<PaginationMetadata | null>(null)
  const currentProduct = ref<Product | null>(null)
  const categories = ref<Category[]>([])
  const categoryAttributes = ref<CategoryAttribute[]>([])
  const isFetchingProducts = ref(false)
  const isMutatingProduct = ref(false)
  const isLoadingCategories = ref(false)
  const isLoadingAttributes = ref(false)
  const currencyConfig = ref<PlatformCurrencyConfig | null>(null)
  const currencyOptions = ref<Array<{ label: SupportedCurrencyCode; value: SupportedCurrencyCode }>>([])

  const setCurrencyConfig = (config: PlatformCurrencyConfig | null) => {
    currencyConfig.value = config
    currencyOptions.value = config
      ? config.items
          .filter((item: PlatformCurrencyConfigItem) => item.enabled)
          .map((item: PlatformCurrencyConfigItem) => ({
            label: item.currencyCode,
            value: item.currencyCode,
          }))
      : []
  }

  const fetchProducts = async (params: GetProductListQuery): Promise<GetProductListResponse> => {
    try {
      isFetchingProducts.value = true
      const result = await productService.getProducts(params)
      products.value = result.items.map(normalizeProduct)
      pagination.value = result.pagination
      return result
    } finally {
      isFetchingProducts.value = false
    }
  }

  const deleteProduct = async (id: string): Promise<void> => {
    try {
      isMutatingProduct.value = true
      await productService.deleteProduct(id)
      products.value = products.value.filter((product) => String(product.id) !== id)
      if (pagination.value) {
        pagination.value = {
          ...pagination.value,
          totalItems: Math.max(0, pagination.value.totalItems - 1),
        }
      }
    } finally {
      isMutatingProduct.value = false
    }
  }

  const fetchCategories = async (): Promise<Category[]> => {
    try {
      isLoadingCategories.value = true
      const result = await categoryService.getCategories()
      categories.value = result
      return result
    } finally {
      isLoadingCategories.value = false
    }
  }

  const fetchCategoryAttributes = async (categoryId: string): Promise<CategoryAttribute[]> => {
    try {
      isLoadingAttributes.value = true
      const result = await categoryService.getCategoryAttributes(categoryId)
      categoryAttributes.value = result
      return result
    } finally {
      isLoadingAttributes.value = false
    }
  }

  const clearCategoryAttributes = () => {
    categoryAttributes.value = []
  }

  const fetchProductById = async (id: string): Promise<Product> => {
    try {
      isMutatingProduct.value = true
      const result = normalizeProduct(await productService.getProductById(id))
      currentProduct.value = result
      return result
    } finally {
      isMutatingProduct.value = false
    }
  }

  const createProduct = async (
    payload: CreateProductRequest,
  ): Promise<CreateProductResponse> => {
    try {
      isMutatingProduct.value = true
      return await productService.createProduct(payload)
    } finally {
      isMutatingProduct.value = false
    }
  }

  const updateProduct = async (id: string, payload: UpdateProductRequest): Promise<void> => {
    try {
      isMutatingProduct.value = true
      await productService.updateProduct(id, payload)
    } finally {
      isMutatingProduct.value = false
    }
  }

  const fetchCurrencyConfig = async () => {
    const config = await configurationService.getCurrencyConfig()
    setCurrencyConfig(config)
    return config
  }

  return {
    products,
    pagination,
    currentProduct,
    categories,
    categoryAttributes,
    isFetchingProducts,
    isMutatingProduct,
    isLoadingCategories,
    isLoadingAttributes,
    currencyConfig,
    currencyOptions,
    fetchProducts,
    deleteProduct,
    fetchCategories,
    fetchCategoryAttributes,
    clearCategoryAttributes,
    fetchProductById,
    createProduct,
    updateProduct,
    fetchCurrencyConfig,
  }
})

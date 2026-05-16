import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAppStore } from '@hivespace/shared'
import { productService } from '@/services/product.service'
import type {
  GetProductDetailResponse,
  GetProductListQuery,
  ProductSummary,
} from '@/types'

const createEmptyProductDetail = (): GetProductDetailResponse => ({
  id: 0,
  name: '',
  category: '',
  description: '',
  variants: [],
  skus: [],
  images: [],
  attributes: [],
  thumbnailUrl: null,
  currentSeller: null,
})

export const useProductStore = defineStore('product', () => {
  const homeProducts = ref<ProductSummary[]>([])
  const homeTotalCount = ref(0)
  const recommendedProducts = ref<ProductSummary[]>([])
  const similarProducts = ref<ProductSummary[]>([])
  const similarTotalCount = ref(0)
  const productDetail = ref<GetProductDetailResponse>(createEmptyProductDetail())
  const isLoadingHomeProducts = ref(false)
  const isLoadingRecommendedProducts = ref(false)
  const isLoadingProductDetail = ref(false)
  const isLoadingSimilarProducts = ref(false)

  const runWithLoading = async <T>(
    loadingRef: { value: boolean },
    action: () => Promise<T>,
  ) => {
    const appStore = useAppStore()
    loadingRef.value = true
    appStore.setLoading(true)
    try {
      return await action()
    } finally {
      loadingRef.value = false
      appStore.setLoading(false)
    }
  }

  const fetchHomeProducts = async (query: GetProductListQuery, append = false) =>
    runWithLoading(isLoadingHomeProducts, async () => {
      const response = await productService.getProducts(query)
      homeProducts.value = append ? [...homeProducts.value, ...response.items] : response.items
      homeTotalCount.value = response.pagination.totalItems
      return response
    })

  const fetchRecommendedProducts = async (query: GetProductListQuery) =>
    runWithLoading(isLoadingRecommendedProducts, async () => {
      const response = await productService.getProducts(query)
      recommendedProducts.value = response.items
      return response
    })

  const fetchProductDetail = async (id: string) =>
    runWithLoading(isLoadingProductDetail, async () => {
      const response = await productService.getProductById(id)
      productDetail.value = response
      return response
    })

  const fetchSimilarProducts = async (query: GetProductListQuery) =>
    runWithLoading(isLoadingSimilarProducts, async () => {
      const response = await productService.getProducts(query)
      similarProducts.value = response.items
      similarTotalCount.value = response.pagination.totalItems
      return response
    })

  const resetProductDetail = () => {
    productDetail.value = createEmptyProductDetail()
    similarProducts.value = []
    similarTotalCount.value = 0
  }

  const resetHomeProducts = () => {
    homeProducts.value = []
    homeTotalCount.value = 0
  }

  return {
    homeProducts,
    homeTotalCount,
    recommendedProducts,
    similarProducts,
    similarTotalCount,
    productDetail,
    isLoadingHomeProducts,
    isLoadingRecommendedProducts,
    isLoadingProductDetail,
    isLoadingSimilarProducts,
    fetchHomeProducts,
    fetchRecommendedProducts,
    fetchProductDetail,
    fetchSimilarProducts,
    resetProductDetail,
    resetHomeProducts,
  }
})

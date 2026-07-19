import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  normalizeCurrencyCode,
  type MoneyIssue,
  useAppStore,
} from '@hivespace/shared'
import { productService } from '@/services/product.service'
import type {
  GetProductDetailResponse,
  GetProductListQuery,
  MoneyReadModel,
  ProductSummary,
  ProductSummaryReadModel,
} from '@/types'

const resolveMoneyIssue = (
  currencyCode: string | number | null | undefined,
): MoneyIssue | null => (normalizeCurrencyCode(currencyCode) ? null : { code: 'missing_currency' })

const isMoneyReadModel = (price: ProductSummaryReadModel['price']): price is MoneyReadModel =>
  typeof price === 'object' && price !== null

const resolveMoneyReadModelIssue = (price: MoneyReadModel): MoneyIssue | null => {
  if (price.isValid === false) {
    return {
      code: price.issueCode ?? 'invalid_money',
      placeholder: price.displayPlaceholder ?? undefined,
    }
  }

  return resolveMoneyIssue(price.currencyCode ?? null)
}

const normalizeProductSummary = (product: ProductSummaryReadModel): ProductSummary => {
  if (!isMoneyReadModel(product.price)) {
    const { price, ...summary } = product

    return {
      ...summary,
      price,
      priceCurrencyCode: normalizeCurrencyCode(product.priceCurrencyCode ?? null),
      priceIssue: product.priceIssue ?? resolveMoneyIssue(product.priceCurrencyCode ?? null),
    }
  }

  const { price, ...summary } = product
  const normalizedCurrencyCode = normalizeCurrencyCode(product.price.currencyCode ?? null)

  return {
    ...summary,
    price: price.amount ?? 0,
    priceCurrencyCode: normalizedCurrencyCode,
    priceIssue: product.priceIssue ?? resolveMoneyReadModelIssue(price),
  }
}

const normalizeProductDetail = (product: GetProductDetailResponse): GetProductDetailResponse => ({
  ...product,
  skus: product.skus.map((sku) => ({
    ...sku,
    price: {
      ...sku.price,
      currencyCode: normalizeCurrencyCode(sku.price.currencyCode ?? sku.price.currency),
      issue: sku.price.issue ?? resolveMoneyIssue(sku.price.currencyCode ?? sku.price.currency),
    },
  })),
})

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
      const items = response.items.map(normalizeProductSummary)
      homeProducts.value = append ? [...homeProducts.value, ...items] : items
      homeTotalCount.value = response.pagination.totalItems
      return response
    })

  const fetchRecommendedProducts = async (query: GetProductListQuery) =>
    runWithLoading(isLoadingRecommendedProducts, async () => {
      const response = await productService.getProducts(query)
      recommendedProducts.value = response.items.map(normalizeProductSummary)
      return response
    })

  const fetchProductDetail = async (id: string) =>
    runWithLoading(isLoadingProductDetail, async () => {
      const response = await productService.getProductById(id)
      productDetail.value = normalizeProductDetail(response)
      return response
    })

  const fetchSimilarProducts = async (query: GetProductListQuery) =>
    runWithLoading(isLoadingSimilarProducts, async () => {
      const response = await productService.getProducts(query)
      similarProducts.value = response.items.map(normalizeProductSummary)
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

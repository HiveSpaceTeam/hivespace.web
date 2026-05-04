import type {
  CreateProductRequest,
  CreateProductResponse,
  GetProductListQuery,
  GetProductListResponse,
  Product,
  UpdateProductRequest,
} from '@/types'
import { apiService } from './api'
import { buildApiUrl } from '@/config'

const PRODUCT_ENDPOINTS = {
  PRODUCTS: '/products',
} as const

class ProductService {
  /**
   * Create a new product
   */
  async createProduct(productData: CreateProductRequest): Promise<CreateProductResponse> {
    const url = buildApiUrl(PRODUCT_ENDPOINTS.PRODUCTS)
    return await apiService.post<CreateProductResponse>(url, productData)
  }

  /**
   * Retrieve products list
   */
  async getProducts(params: GetProductListQuery): Promise<GetProductListResponse> {
    const url = buildApiUrl(PRODUCT_ENDPOINTS.PRODUCTS)
    return await apiService.get<GetProductListResponse>(url, { params })
  }

  /**
   * Retrieve a single product by id
   */
  async getProductById(id: string): Promise<Product> {
    const url = buildApiUrl(`${PRODUCT_ENDPOINTS.PRODUCTS}/${id}`)
    return await apiService.get<Product>(url)
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, payload: UpdateProductRequest): Promise<void> {
    const url = buildApiUrl(`${PRODUCT_ENDPOINTS.PRODUCTS}/${id}`)
    await apiService.put<void>(url, payload)
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    const url = buildApiUrl(`${PRODUCT_ENDPOINTS.PRODUCTS}/${id}`)
    await apiService.delete<void>(url)
  }
}

export const productService = new ProductService()

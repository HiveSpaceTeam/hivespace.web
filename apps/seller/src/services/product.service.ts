import type {
  CreateProductRequest,
  CreateProductResponse,
  GetProductListQuery,
  GetProductListResponse,
  Product,
  UpdateProductRequest,
} from '@/types'
import { BaseService } from './base.service'

class ProductService extends BaseService {
  async createProduct(productData: CreateProductRequest): Promise<CreateProductResponse> {
    return this.post<CreateProductResponse>('/products', productData)
  }

  async getProducts(params: GetProductListQuery): Promise<GetProductListResponse> {
    return this.get<GetProductListResponse>('/products', { params })
  }

  async getProductById(id: string): Promise<Product> {
    return this.get<Product>(`/products/${id}`)
  }

  async updateProduct(id: string, payload: UpdateProductRequest): Promise<void> {
    return this.put<void>(`/products/${id}`, payload)
  }

  async deleteProduct(id: string): Promise<void> {
    return this.delete<void>(`/products/${id}`)
  }
}

export const productService = new ProductService()

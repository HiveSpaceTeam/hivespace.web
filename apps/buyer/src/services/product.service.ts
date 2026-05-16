import { BaseService } from './base.service'
import type {
  GetProductDetailResponse,
  GetProductListQuery,
  GetProductListResponse,
} from '@/types'

class ProductService extends BaseService {
  getProducts(params: GetProductListQuery): Promise<GetProductListResponse> {
    return this.get<GetProductListResponse>('/products/summaries', { params })
  }

  getProductById(id: string): Promise<GetProductDetailResponse> {
    return this.get<GetProductDetailResponse>(`/products/detail/${id}`)
  }
}

export const productService = new ProductService()

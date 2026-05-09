import { BaseService } from './base.service'
import type { ProductSummary, PagingRequest, PagedResponse, ProductDetail } from '@/types'

class ProductService extends BaseService {
  getProducts(params: PagingRequest): Promise<PagedResponse<ProductSummary>> {
    return this.get<PagedResponse<ProductSummary>>('/products/summaries', { params })
  }

  getProductById(id: string): Promise<ProductDetail> {
    return this.get<ProductDetail>(`/products/detail/${id}`)
  }
}

export const productService = new ProductService()

import { OrderProcessStatus } from '@/types'
import type { GetOrderListQuery, GetOrderListResponse } from '@/types'
import { BaseService } from './base.service'

class OrderService extends BaseService {
  async getOrders(query: GetOrderListQuery): Promise<GetOrderListResponse> {
    const params: Record<string, string | number> = {
      page: query.page,
      pageSize: query.pageSize,
    }

    if (query.searchField) params.searchField = query.searchField
    if (query.searchValue) params.searchValue = query.searchValue
    if (query.processStatus !== OrderProcessStatus.All) params.processStatus = query.processStatus

    return this.get<GetOrderListResponse>('/orders/seller', { params })
  }

  async confirmOrder(orderId: string): Promise<void> {
    return this.post<void>(`/orders/${orderId}/confirm`, {})
  }

  async rejectOrder(orderId: string, reason: string): Promise<void> {
    return this.post<void>(`/orders/${orderId}/reject`, { reason })
  }
}

export const orderService = new OrderService()

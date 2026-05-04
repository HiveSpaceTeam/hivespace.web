import { apiService } from './api'
import { buildApiUrl } from '@/config'
import { OrderProcessStatus } from '@/types'
import type { GetOrderListQuery, GetOrderListResponse } from '@/types'

const ORDER_ENDPOINTS = {
  SELLER: '/orders/seller',
  CONFIRM: (id: string) => `/orders/${id}/confirm`,
  REJECT: (id: string) => `/orders/${id}/reject`,
} as const

class OrderService {
  async getOrders(query: GetOrderListQuery): Promise<GetOrderListResponse> {
    const url = buildApiUrl(ORDER_ENDPOINTS.SELLER)
    const params: Record<string, string | number> = {
      page: query.page,
      pageSize: query.pageSize,
    }

    if (query.searchField) params.searchField = query.searchField
    if (query.searchValue) params.searchValue = query.searchValue
    if (query.processStatus !== OrderProcessStatus.All) params.processStatus = query.processStatus

    const response = await apiService.get<GetOrderListResponse>(url, { params })

    return response
  }

  async confirmOrder(orderId: string): Promise<void> {
    const url = buildApiUrl(ORDER_ENDPOINTS.CONFIRM(orderId))
    await apiService.post(url, {})
  }

  async rejectOrder(orderId: string, reason: string): Promise<void> {
    const url = buildApiUrl(ORDER_ENDPOINTS.REJECT(orderId))
    await apiService.post(url, { reason })
  }
}

export const orderService = new OrderService()

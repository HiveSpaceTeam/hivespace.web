import { BaseService } from './base.service'
import type { GetOrdersResponse, GetOrdersQuery, OrderDetail } from '@/types'

class OrderService extends BaseService {
  getOrders(params: Partial<GetOrdersQuery>): Promise<GetOrdersResponse> {
    return this.get<GetOrdersResponse>('/orders', { params })
  }

  getOrderById(orderId: string): Promise<OrderDetail> {
    return this.get<OrderDetail>(`/orders/${orderId}`)
  }
}

export const orderService = new OrderService()

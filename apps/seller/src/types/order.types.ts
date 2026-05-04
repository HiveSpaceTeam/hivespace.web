import type { PaginationMetadata } from '@hivespace/shared'

export enum OrderProcessStatus {
  All = 0,
  PendingConfirmation = 1,
  ReadyToShip = 2,
  Shipping = 3,
  Delivered = 4,
  ReturnCancel = 5,
}

export enum OrderStatus {
  Created = 'Created',
  Paid = 'Paid',
  COD = 'COD',
  Confirmed = 'Confirmed',
  Rejected = 'Rejected',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Claimed = 'Claimed',
  Refunding = 'Refunding',
  Refunded = 'Refunded',
  Solved = 'Solved',
  Expired = 'Expired',
  ReadyToShip = 'ReadyToShip',
}

export interface OrderItem {
  id: string
  productName: string
  productImageUrl: string
  variation: string | null
  quantity: number
  tag: string | null
}

export interface Order {
  id: string
  orderCode: string
  buyerName: string
  items: OrderItem[]
  totalAmount: number
  paymentMethod: string
  status: OrderStatus
  actionDateTime: string
  createdAt: string
}

export interface GetOrderListResponse {
  orders: Order[]
  pagination: PaginationMetadata
}

export interface GetOrderListQuery {
  processStatus: OrderProcessStatus
  searchField?: 'orderCode' | 'customerName' | 'product'
  searchValue?: string
  page: number
  pageSize: number
}

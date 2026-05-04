import type { PaginationMetadata } from '@hivespace/shared'
export { RoleFilter, StatusFilter } from '@hivespace/shared'

export interface User {
  id: string
  username: string
  fullName: string
  email: string
  status: number
  isSeller: boolean
  createdAt: string
  updatedAt: string | null
  lastLoginAt: string | null
  avatarUrl: string
}

// Query params for GET /admins/users
export interface GetUserListQuery {
  page?: number
  pageSize?: number
  role?: number
  status?: number
  searchTerm?: string
  sort?: string
}

// Response shape for GET /admins/users
export interface GetUserListResponse {
  users: User[]
  pagination: PaginationMetadata
}

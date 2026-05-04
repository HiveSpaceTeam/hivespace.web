import {
  type Admin,
  type CreateAdminRequest,
  type CreateAdminResponse,
  type GetAdminListQuery,
  type GetAdminListResponse,
} from '@/types'
import { apiService } from './api'
import { buildApiUrl } from '@/config'
import { UserType } from '@hivespace/shared'

// Admin API endpoints (without version prefix since buildApiUrl handles versioning)
const ADMIN_ENDPOINTS = {
  ADMINS: '/admins',
} as const

// Admin service class
class AdminService {
  /**
   * Create a new admin user
   */
  async createAdmin(adminData: CreateAdminRequest): Promise<CreateAdminResponse> {
    const url = buildApiUrl(ADMIN_ENDPOINTS.ADMINS)
    return await apiService.post<CreateAdminResponse>(url, adminData)
  }

  /**
   * Get a paginated list of admins
   */
  async getAdmins(params?: GetAdminListQuery): Promise<GetAdminListResponse> {
    const url = buildApiUrl(ADMIN_ENDPOINTS.ADMINS)
    return await apiService.get<GetAdminListResponse>(url, { params })
  }

  /**
   * Activate/Deactivate an admin user
   */
  async updateAdminStatus(userId: string, isActive: boolean): Promise<Admin> {
    const url = buildApiUrl(`${ADMIN_ENDPOINTS.ADMINS}/users/status`)
    return await apiService.put<Admin>(url, { userId, isActive, responseType: UserType.Admin })
  }

  /**
   * Delete an admin user (soft delete)
   */
  async deleteUser(userId: string): Promise<void> {
    const url = buildApiUrl(`${ADMIN_ENDPOINTS.ADMINS}/users/${userId}`)
    await apiService.delete(url)
  }
}

// Create and export the admin service instance
export const adminService = new AdminService()

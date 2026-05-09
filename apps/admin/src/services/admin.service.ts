import {
  type Admin,
  type CreateAdminRequest,
  type CreateAdminResponse,
  type GetAdminListQuery,
  type GetAdminListResponse,
} from '@/types'
import { UserType } from '@hivespace/shared'
import { BaseService } from './base.service'

class AdminService extends BaseService {
  async createAdmin(adminData: CreateAdminRequest): Promise<CreateAdminResponse> {
    return this.post<CreateAdminResponse>('/admins', adminData)
  }

  async getAdmins(params?: GetAdminListQuery): Promise<GetAdminListResponse> {
    return this.get<GetAdminListResponse>('/admins', { params })
  }

  async updateAdminStatus(userId: string, isActive: boolean): Promise<Admin> {
    return this.put<Admin>('/admins/users/status', { userId, isActive, responseType: UserType.Admin })
  }

  async deleteUser(userId: string): Promise<void> {
    return this.delete<void>(`/admins/users/${userId}`)
  }
}

export const adminService = new AdminService()

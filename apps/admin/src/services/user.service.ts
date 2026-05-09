import {
  type GetUserListQuery,
  type GetUserListResponse,
  type User,
} from '@/types'
import { UserType } from '@hivespace/shared'
import { BaseService } from './base.service'

class UserService extends BaseService {
  async getUsers(params?: GetUserListQuery): Promise<GetUserListResponse> {
    return this.get<GetUserListResponse>('/admins/users', { params })
  }

  async deleteUser(userId: string): Promise<void> {
    return this.delete<void>(`/admins/users/${userId}`)
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<User> {
    return this.put<User>('/admins/users/status', { userId, isActive, responseType: UserType.User })
  }
}

export const userService = new UserService()

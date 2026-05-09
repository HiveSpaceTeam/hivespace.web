import { BaseService } from './base.service'
import type { UserProfileResponse, UpdateProfileRequest } from '@/types'

class UserService extends BaseService {
  getProfile(): Promise<UserProfileResponse> {
    return this.get<UserProfileResponse>('/users/me')
  }

  updateProfile(data: UpdateProfileRequest): Promise<void> {
    return this.put<void>('/users/me', data)
  }
}

export const userService = new UserService()

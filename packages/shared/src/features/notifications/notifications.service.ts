import type { NotificationListResponse, INotificationService } from './notifications.types'
import type { ApiRequestService, BuildApiUrl } from '../service.types'

const ENDPOINTS = {
  LIST: '/notifications',
  UNREAD_COUNT: '/notifications/unread-count',
  MARK_READ: (id: string) => `/notifications/${id}/read`,
} as const

export interface NotificationServiceOptions {
  apiService: ApiRequestService
  buildApiUrl: BuildApiUrl
}

export const createNotificationService = (
  options: NotificationServiceOptions,
): INotificationService => {
  const { apiService, buildApiUrl } = options

  return {
    getNotifications: (
      page = 1,
      pageSize = 20,
      unreadOnly = false,
    ): Promise<NotificationListResponse> =>
      apiService.get<NotificationListResponse>(buildApiUrl(ENDPOINTS.LIST), {
        params: { page, pageSize, unreadOnly },
      }),
    async getUnreadCount(): Promise<number> {
      const response = await apiService.get<{ count: number }>(
        buildApiUrl(ENDPOINTS.UNREAD_COUNT),
      )
      return response.count
    },
    markAsRead: (id: string): Promise<void> =>
      apiService.put(buildApiUrl(ENDPOINTS.MARK_READ(id)), {}),
  }
}

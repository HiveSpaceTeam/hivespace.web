export enum NotificationStatus {
  Pending = 0,
  Sent = 1,
  Read = 5,
}

export enum NotificationChannel {
  InApp = 2,
}

export interface NotificationDto {
  id: string
  channel: NotificationChannel
  eventType: string
  status: NotificationStatus
  payload: string
  createdAt: string
  readAt?: string
}

export interface NotificationListResponse {
  notifications: NotificationDto[]
  hasMore: boolean
}

export interface NotificationHubEvent {
  id: string
  eventType: string
  payload: string
  createdAt: string
}

export interface INotificationService {
  getNotifications(
    page: number,
    pageSize: number,
    unreadOnly?: boolean,
  ): Promise<NotificationListResponse>
  getUnreadCount(): Promise<number>
  markAsRead(id: string): Promise<void>
}

export interface InAppNotification {
  id: string
  eventType: string
  message: string
  isRead: boolean
  createdAt: string
  avatarUrl?: string
  link?: string
}

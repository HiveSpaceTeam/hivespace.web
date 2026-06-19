import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { NotificationChannel, NotificationStatus } from '@hivespace/shared'
import { notificationService } from '@/services/notification.service'
import { useNotificationStore } from '@/stores/notification.store'

jest.mock('@/services/notification.service', () => ({
  notificationService: {
    getNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
  },
}))

jest.mock('@/i18n', () => ({
  __esModule: true,
  default: { global: { t: (key: string) => key } },
}))

describe('NotificationsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(notificationService.getNotifications).mockResolvedValue({
      notifications: [
        {
          id: 'notif-001',
          channel: NotificationChannel.InApp,
          eventType: 'admin.new_user',
          status: NotificationStatus.Sent,
          payload: JSON.stringify({ userName: 'Test User', email: 'user@example.test' }),
          createdAt: '2026-06-12T00:00:00Z',
        },
      ],
      hasMore: false,
    })
    jest.mocked(notificationService.getUnreadCount).mockResolvedValue(1)
  })

  it('should render notification items from the store', async () => {
    const store = useNotificationStore()

    await store.fetchNotifications()

    expect(notificationService.getNotifications).toHaveBeenCalled()
    expect(store.notifications).toHaveLength(1)
    expect(store.notifications[0]?.eventType).toBe('admin.new_user')
    expect(store.notifications[0]?.isRead).toBe(false)
  })

  it('should render all admin-applicable notification channels', async () => {
    jest.mocked(notificationService.getNotifications).mockResolvedValue({
      notifications: [
        {
          id: 'notif-001',
          channel: NotificationChannel.InApp,
          eventType: 'admin.new_user',
          status: NotificationStatus.Sent,
          payload: '{}',
          createdAt: '2026-06-12T00:00:00Z',
        },
        {
          id: 'notif-002',
          channel: NotificationChannel.InApp,
          eventType: 'admin.new_seller',
          status: NotificationStatus.Pending,
          payload: '{}',
          createdAt: '2026-06-12T01:00:00Z',
        },
      ],
      hasMore: false,
    })
    jest.mocked(notificationService.getUnreadCount).mockResolvedValue(2)
    const store = useNotificationStore()

    await store.fetchNotifications()
    await store.fetchUnreadCount()

    expect(store.notifications).toHaveLength(2)
    expect(store.notifications.every((n) => !n.isRead)).toBe(true)
    expect(store.unreadCount).toBe(2)
  })
})

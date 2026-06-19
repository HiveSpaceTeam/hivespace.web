import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { NotificationChannel, NotificationStatus } from '@hivespace/shared'
import { notificationService } from '@/services/notification.service'
import { useNotificationStore } from './notification.store'

jest.mock('@/services/notification.service', () => ({
  notificationService: {
    getNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
  },
}))

describe('useNotificationStore (admin)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(notificationService.getNotifications).mockResolvedValue({
      notifications: [
        {
          id: 'notification-001',
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

  it('should load notifications from the API', async () => {
    const store = useNotificationStore()

    await store.fetchNotifications()

    expect(notificationService.getNotifications).toHaveBeenCalled()
    expect(store.notifications).toHaveLength(1)
  })

  it('should call mark-as-read endpoint when marking a notification read', async () => {
    jest.mocked(notificationService.markAsRead).mockResolvedValue(undefined)
    const store = useNotificationStore()
    store.prependFromHub({
      id: 'notification-002',
      eventType: 'admin.new_seller',
      payload: JSON.stringify({ sellerName: 'Seller A', storeName: 'Store A' }),
      createdAt: '2026-06-12T01:00:00Z',
    })

    await store.markAsRead('notification-002')

    expect(notificationService.markAsRead).toHaveBeenCalledWith('notification-002')
  })
})

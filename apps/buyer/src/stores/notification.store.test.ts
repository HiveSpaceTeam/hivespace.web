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

describe('useNotificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(notificationService.getNotifications).mockResolvedValue({
      notifications: [
        {
          id: 'notification-001',
          channel: NotificationChannel.InApp,
          eventType: 'order.confirmed',
          status: NotificationStatus.Sent,
          payload: JSON.stringify({ storeName: 'Hive Store', orderCode: 'HS-001' }),
          createdAt: '2026-06-12T00:00:00Z',
        },
      ],
      hasMore: false,
    })
    jest.mocked(notificationService.getUnreadCount).mockResolvedValue(1)
    jest.mocked(notificationService.markAsRead).mockResolvedValue(undefined)
  })

  it('should fetch notifications from the shared notification service', async () => {
    const store = useNotificationStore()

    await store.fetchNotifications()

    expect(notificationService.getNotifications).toHaveBeenCalledWith(1, 20, false)
    expect(store.notifications[0]?.link).toBe('/orders')
    expect(store.notifications[0]?.isRead).toBe(false)
  })

  it('should decrement unread count when a notification is marked read', async () => {
    const store = useNotificationStore()
    await store.fetchNotifications()
    await store.fetchUnreadCount()

    await store.markAsRead('notification-001')

    expect(notificationService.markAsRead).toHaveBeenCalledWith('notification-001')
    expect(store.unreadCount).toBe(0)
    expect(store.notifications[0]?.isRead).toBe(true)
  })

  it('should prepend realtime notifications from hub payloads', () => {
    const store = useNotificationStore()

    store.prependFromHub({
      id: 'notification-002',
      eventType: 'order.cancelled',
      payload: JSON.stringify({ orderCode: 'HS-002' }),
      createdAt: '2026-06-12T01:00:00Z',
    })

    expect(store.notifications[0]?.id).toBe('notification-002')
    expect(store.unreadCount).toBe(1)
    expect(store.toastQueue).toHaveLength(1)
  })

  it('prependFromHub_WithUnknownEventType_ResolvesDefaultLink', () => {
    const store = useNotificationStore()

    store.prependFromHub({
      id: 'notification-003',
      eventType: 'user.followed',
      payload: JSON.stringify({}),
      createdAt: '2026-06-12T02:00:00Z',
    })

    expect(store.notifications[0]?.link).toBe('/notifications')
  })

  it('prependFromHub_WithUnknownEventType_ResolvesGenericMessage', () => {
    const store = useNotificationStore()

    store.prependFromHub({
      id: 'notification-004',
      eventType: 'product.restocked',
      payload: JSON.stringify({ productId: 42 }),
      createdAt: '2026-06-12T03:00:00Z',
    })

    expect(store.notifications[0]?.link).toBe('/notifications')
    expect(store.notifications[0]?.message).toBeTruthy()
  })

  it('prependFromHub_WithNullPayloadFields_FallsBackToEmptyStrings', () => {
    const store = useNotificationStore()

    store.prependFromHub({
      id: 'notification-005',
      eventType: 'order.confirmed',
      payload: JSON.stringify({ storeName: null, orderCode: null }),
      createdAt: '2026-06-12T04:00:00Z',
    })

    expect(store.notifications[0]?.link).toBe('/orders')
    expect(store.notifications[0]?.message).toBeTruthy()
  })

  it('prependFromHub_WithNullOrderCode_FallsBackToEmptyString', () => {
    const store = useNotificationStore()

    store.prependFromHub({
      id: 'notification-006',
      eventType: 'order.cancelled',
      payload: JSON.stringify({ orderCode: null }),
      createdAt: '2026-06-12T05:00:00Z',
    })

    expect(store.notifications[0]?.link).toBe('/orders')
    expect(store.notifications[0]?.message).toBeTruthy()
  })
})

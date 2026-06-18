import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { NotificationChannel, NotificationStatus } from '@hivespace/shared'
import i18n from '@/i18n'
import { notificationService } from '@/services/notification.service'
import { useNotificationStore } from './notification.store'

jest.mock('@/services/notification.service', () => ({
  notificationService: {
    getNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
  },
}))

describe('useNotificationStore (seller)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
    jest.mocked(notificationService.getUnreadCount).mockResolvedValue(1)
    jest.mocked(notificationService.markAsRead).mockResolvedValue(undefined)
  })

  it.each([
    [
      'seller.new_order',
      { orderCode: 'ORD-001', buyerName: 'Test Buyer' },
      '/orders/all',
      i18n.global.t('notification.events.newOrder', {
        orderCode: 'ORD-001',
        buyerName: 'Test Buyer',
      }),
    ],
    [
      'inventory.low_stock',
      { productName: 'Coffee Beans', remaining: 2 },
      '/product/list',
      i18n.global.t('notification.events.lowStock', {
        productName: 'Coffee Beans',
        remaining: 2,
      }),
    ],
    [
      'unknown.event',
      { any: 'value' },
      '/notifications',
      i18n.global.t('notification.events.generic', { eventType: 'unknown.event' }),
    ],
  ])('should resolve seller message and link for %s', async (
    eventType,
    payload,
    expectedLink,
    expectedMessage,
  ) => {
    jest.mocked(notificationService.getNotifications).mockResolvedValue({
      notifications: [
        {
          id: `notification-${eventType}`,
          channel: NotificationChannel.InApp,
          eventType,
          status: NotificationStatus.Sent,
          payload: JSON.stringify(payload),
          createdAt: '2026-06-12T00:00:00Z',
        },
      ],
      hasMore: false,
    })

    const store = useNotificationStore()
    await store.fetchNotifications()

    expect(store.notifications).toHaveLength(1)
    expect(store.notifications[0]).toMatchObject({
      eventType,
      link: expectedLink,
      message: expectedMessage,
    })
  })

  it('should decrement unread count after marking read', async () => {
    jest.mocked(notificationService.getNotifications).mockResolvedValue({
      notifications: [
        {
          id: 'notification-001',
          channel: NotificationChannel.InApp,
          eventType: 'seller.new_order',
          status: NotificationStatus.Sent,
          payload: JSON.stringify({ orderCode: 'ORD-001', buyerName: 'Test Buyer' }),
          createdAt: '2026-06-12T00:00:00Z',
        },
      ],
      hasMore: false,
    })

    const store = useNotificationStore()
    store.unreadCount = 1
    await store.fetchNotifications()

    await store.markAsRead('notification-001')

    expect(notificationService.markAsRead).toHaveBeenCalledWith('notification-001')
    expect(store.notifications[0].isRead).toBe(true)
    expect(store.unreadCount).toBe(0)
  })

  it('should fall back to blank order payload fields when hub payload is incomplete', async () => {
    jest.mocked(notificationService.getNotifications).mockResolvedValue({
      notifications: [
        {
          id: 'notification-missing-order-fields',
          channel: NotificationChannel.InApp,
          eventType: 'seller.new_order',
          status: NotificationStatus.Sent,
          payload: JSON.stringify({}),
          createdAt: '2026-06-12T00:00:00Z',
        },
      ],
      hasMore: false,
    })

    const store = useNotificationStore()
    await store.fetchNotifications()

    expect(store.notifications[0].message).toBe(
      i18n.global.t('notification.events.newOrder', {
        orderCode: '',
        buyerName: '',
      }),
    )
  })

  it('should fall back to default low-stock payload fields when hub payload is incomplete', async () => {
    jest.mocked(notificationService.getNotifications).mockResolvedValue({
      notifications: [
        {
          id: 'notification-missing-stock-fields',
          channel: NotificationChannel.InApp,
          eventType: 'inventory.low_stock',
          status: NotificationStatus.Sent,
          payload: JSON.stringify({}),
          createdAt: '2026-06-12T00:00:00Z',
        },
      ],
      hasMore: false,
    })

    const store = useNotificationStore()
    await store.fetchNotifications()

    expect(store.notifications[0].message).toBe(
      i18n.global.t('notification.events.lowStock', {
        productName: '',
        remaining: 0,
      }),
    )
  })
})

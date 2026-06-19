import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { createNotificationStore } from './createNotificationStore'
import type { INotificationService, NotificationDto } from './notifications.types'
import { NotificationChannel, NotificationStatus } from './notifications.types'

const makeDto = (overrides: Partial<NotificationDto> = {}): NotificationDto => ({
  id: 'notif-001',
  channel: NotificationChannel.InApp,
  eventType: 'order.placed',
  payload: '{}',
  status: NotificationStatus.Sent,
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
})

const makeService = (): jest.Mocked<INotificationService> => ({
  getNotifications: jest.fn(),
  getUnreadCount: jest.fn(),
  markAsRead: jest.fn(),
})

const resolveLink = jest.fn(() => '/notifications')
const resolveMessage = jest.fn((eventType: string) => `Message for ${eventType}`)

const makeStore = (service: INotificationService) => {
  const useStore = createNotificationStore({ service, resolveLink, resolveMessage, pageSize: 10 })
  return useStore()
}

describe('createNotificationStore', () => {
  let service: jest.Mocked<INotificationService>

  beforeEach(() => {
    setActivePinia(createPinia())
    service = makeService()
    service.getNotifications.mockResolvedValue({ notifications: [makeDto()], hasMore: false })
    service.getUnreadCount.mockResolvedValue(3)
    service.markAsRead.mockResolvedValue(undefined)
    resolveLink.mockReturnValue('/notifications')
    resolveMessage.mockImplementation((eventType: string) => `Message for ${eventType}`)
  })

  it('should load notifications from the API', async () => {
    const store = makeStore(service)
    await store.fetchNotifications()
    expect(service.getNotifications).toHaveBeenCalledWith(1, 10, false)
    expect(store.notifications).toHaveLength(1)
    expect(store.notifications[0]?.id).toBe('notif-001')
    expect(store.isLoading).toBe(false)
  })

  it('should set unread count when fetching', async () => {
    const store = makeStore(service)
    await store.fetchUnreadCount()
    expect(service.getUnreadCount).toHaveBeenCalled()
    expect(store.unreadCount).toBe(3)
  })

  it('should decrement unread count when marking as read', async () => {
    service.getUnreadCount.mockResolvedValue(2)
    const store = makeStore(service)
    await store.fetchNotifications()
    await store.fetchUnreadCount()

    await store.markAsRead('notif-001')

    expect(service.markAsRead).toHaveBeenCalledWith('notif-001')
    expect(store.notifications[0]?.isRead).toBe(true)
    expect(store.unreadCount).toBe(1)
  })

  it('should append notification to front when received from hub', async () => {
    const store = makeStore(service)
    await store.fetchNotifications()
    const initialCount = store.notifications.length

    store.prependFromHub({
      id: 'notif-hub-001',
      eventType: 'order.shipped',
      payload: '{}',
      createdAt: '2026-01-02T00:00:00Z',
    })

    expect(store.notifications).toHaveLength(initialCount + 1)
    expect(store.notifications[0]?.id).toBe('notif-hub-001')
    expect(store.unreadCount).toBe(1)
    expect(store.toastQueue).toHaveLength(1)
  })

  it('should remove toast from queue when dismissed', async () => {
    const store = makeStore(service)
    store.prependFromHub({
      id: 'toast-001',
      eventType: 'order.placed',
      payload: '{}',
      createdAt: '2026-01-02T00:00:00Z',
    })
    expect(store.toastQueue).toHaveLength(1)

    store.dismissToast('toast-001')

    expect(store.toastQueue).toHaveLength(0)
  })

  it('should load next page when more notifications exist', async () => {
    const secondPageDto = makeDto({ id: 'notif-002' })
    service.getNotifications
      .mockResolvedValueOnce({ notifications: [makeDto()], hasMore: true })
      .mockResolvedValueOnce({ notifications: [secondPageDto], hasMore: false })
    const store = makeStore(service)
    await store.fetchNotifications()
    expect(store.hasMore).toBe(true)

    await store.loadMore()

    expect(service.getNotifications).toHaveBeenCalledTimes(2)
    expect(store.notifications).toHaveLength(2)
    expect(store.hasMore).toBe(false)
    expect(store.isLoading).toBe(false)
  })

  it('should do nothing when no more notifications to load', async () => {
    service.getNotifications.mockResolvedValue({ notifications: [makeDto()], hasMore: false })
    const store = makeStore(service)
    await store.fetchNotifications()
    expect(store.hasMore).toBe(false)

    await store.loadMore()

    expect(service.getNotifications).toHaveBeenCalledTimes(1)
  })

  it('should silently handle errors when fetching unread count', async () => {
    service.getUnreadCount.mockRejectedValue(new Error('Network error'))
    const store = makeStore(service)

    await expect(store.fetchUnreadCount()).resolves.not.toThrow()
    expect(store.unreadCount).toBe(0)
  })

  it('should ignore duplicate notification from hub', async () => {
    const store = makeStore(service)
    const event = {
      id: 'notif-dup',
      eventType: 'order.placed',
      payload: '{}',
      createdAt: '2026-01-02T00:00:00Z',
    }
    store.prependFromHub(event)
    const countAfterFirst = store.notifications.length

    store.prependFromHub(event)

    expect(store.notifications).toHaveLength(countAfterFirst)
  })

  it('should handle invalid JSON payload gracefully', () => {
    const store = makeStore(service)
    store.prependFromHub({
      id: 'notif-bad-json',
      eventType: 'order.placed',
      payload: 'not-valid-json{{{{',
      createdAt: '2026-01-02T00:00:00Z',
    })
    expect(store.notifications).toHaveLength(1)
    expect(store.notifications[0]!.id).toBe('notif-bad-json')
  })
})

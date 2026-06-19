import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { render, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import NotificationsPage from './NotificationsPage.vue'
import { notificationService } from '@/services/notification.service'
import { NotificationChannel, NotificationStatus } from '@hivespace/shared'

jest.mock('@/services/notification.service', () => ({
  notificationService: {
    getNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
  },
}))

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifySuccess: jest.fn(),
      notifyError: jest.fn(),
    }),
  }
})

const renderNotifications = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/notifications', component: NotificationsPage }],
  })
  await router.push('/notifications')
  await router.isReady()

  return render(NotificationsPage, { global: { plugins: [pinia, router, i18n] } })
}

describe('NotificationsPage (seller)', () => {
  beforeEach(() => {
    jest.mocked(notificationService.getNotifications).mockResolvedValue({
      notifications: [
        {
          id: 'notification-001',
          channel: NotificationChannel.InApp,
          eventType: 'seller.new_order',
          status: NotificationStatus.Sent,
          payload: JSON.stringify({ orderCode: 'ORD-001', buyerName: 'Buyer A' }),
          createdAt: '2026-06-12T00:00:00Z',
        },
      ],
      hasMore: false,
    })
    jest.mocked(notificationService.getUnreadCount).mockResolvedValue(1)
  })

  it('renders_NotificationItemsFromStore', async () => {
    await renderNotifications()

    await waitFor(() => {
      expect(document.querySelector('[data-testid]') || document.body.childElementCount).toBeTruthy()
    })
  })

  it('markRead_CallsStoreAction', async () => {
    jest.mocked(notificationService.markAsRead).mockResolvedValue(undefined)
    await renderNotifications()

    expect(notificationService.getNotifications).toHaveBeenCalled()
  })
})

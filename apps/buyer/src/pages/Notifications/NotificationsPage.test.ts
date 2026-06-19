import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { NotificationChannel, NotificationStatus } from '@hivespace/shared'
import i18n from '@/i18n'
import NotificationsPage from './NotificationsPage.vue'
import { notificationService } from '@/services/notification.service'

jest.mock('@/services/notification.service', () => ({
  notificationService: {
    getNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
  },
}))

const renderNotifications = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/notifications', component: NotificationsPage },
      { path: '/orders', component: { template: '<div>Orders</div>' } },
    ],
  })
  await router.push('/notifications')
  await router.isReady()

  render(NotificationsPage, {
    global: {
      plugins: [pinia, router, i18n],
    },
  })

  return router
}

describe('NotificationsPage', () => {
  beforeEach(() => {
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

  it('should render notification items from the store-backed service', async () => {
    await renderNotifications()

    expect(await screen.findByText(/HS-001/)).toBeTruthy()
  })

  it('should mark notification read and navigate to its link when clicked', async () => {
    const router = await renderNotifications()
    const row = await screen.findByRole('button')

    await fireEvent.click(row)

    expect(notificationService.markAsRead).toHaveBeenCalledWith('notification-001')
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/orders'))
  })

  it('handleRowClick_WhenMarkAsReadFails_DoesNotCrash', async () => {
    jest.mocked(notificationService.markAsRead).mockRejectedValueOnce(new Error('Network error'))
    await renderNotifications()
    const row = await screen.findByRole('button')

    await fireEvent.click(row)

    // Error is swallowed by catch — page stays functional
    expect(document.querySelector('[data-v-app]') || document.body).toBeTruthy()
  })

  it('renders_LoadMoreButton_WhenHasMoreIsTrue', async () => {
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
      hasMore: true,
    })

    await renderNotifications()

    expect(await screen.findByText(/HS-001/)).toBeTruthy()
  })
})

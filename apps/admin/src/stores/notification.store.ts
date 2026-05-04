import { createNotificationStore } from '@hivespace/shared'
import { notificationService } from '@/services/notification.service'
import i18n from '@/i18n'

const resolveLink = (eventType: string): string => {
  switch (eventType) {
    case 'admin.new_user': return '/users'
    case 'admin.new_seller': return '/sellers'
    default: return '/notifications'
  }
}

const resolveMessage = (eventType: string, payload: Record<string, unknown>): string => {
  const t = i18n.global.t
  switch (eventType) {
    case 'admin.new_user':
      return t('notification.events.newUser', {
        userName: String(payload.userName ?? ''),
        email: String(payload.email ?? ''),
      })
    case 'admin.new_seller':
      return t('notification.events.newSeller', {
        sellerName: String(payload.sellerName ?? ''),
        storeName: String(payload.storeName ?? ''),
      })
    default:
      return t('notification.events.generic', { eventType })
  }
}

export const useNotificationStore = createNotificationStore({
  service: notificationService,
  resolveLink,
  resolveMessage,
})

import { onMounted, onUnmounted, readonly, ref, watch } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useNotificationHub } from '../../composables/useNotificationHub'
import type { NotificationHubEvent } from './notifications.types'

interface NotificationRealtimeOptions {
  hubBaseUrl: string
  onReceive: (event: NotificationHubEvent) => void
  onConnected?: () => Promise<void> | void
  onDisconnected?: () => Promise<void> | void
}

export const useNotificationRealtime = (options: NotificationRealtimeOptions) => {
  const { hubBaseUrl, onReceive, onConnected, onDisconnected } = options

  const { currentUser, getCurrentUser } = useAuth()
  const isConnected = ref(false)
  const { connect, disconnect, connectionStatus } = useNotificationHub(hubBaseUrl, onReceive)

  const connectRealtime = async () => {
    if (isConnected.value) return

    await connect()

    if (connectionStatus.value === 'connected') {
      isConnected.value = true
      await onConnected?.()
    }
  }

  const disconnectRealtime = async () => {
    if (!isConnected.value && connectionStatus.value === 'disconnected') return

    await disconnect()
    isConnected.value = false
    await onDisconnected?.()
  }

  onMounted(() => {
    void getCurrentUser()
  })

  watch(
    () => currentUser.value,
    async (user, previousUser) => {
      if (user) {
        if (previousUser && previousUser !== user) {
          await disconnectRealtime()
        }
        await connectRealtime()
      } else if (previousUser) {
        await disconnectRealtime()
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    void disconnectRealtime()
  })

  return {
    isConnected: readonly(isConnected),
    connectionStatus,
    connectRealtime,
    disconnectRealtime,
    refreshCurrentUser: getCurrentUser,
  }
}

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuth } from '@hivespace/shared'
import type { RegisterStoreRequest, RegisterStoreResponse } from '@/types'
import refreshToken from '@/services/refresh.service'
import { storeService } from '@/services/store.service'

export const useStoreStore = defineStore('store', () => {
  const currentStore = ref<RegisterStoreResponse | null>(null)
  const isLoading = ref(false)

  const registerStore = async (request: RegisterStoreRequest) => {
    isLoading.value = true

    try {
      const response = await storeService.registerStore(request)
      const { getCurrentUser } = useAuth()
      const currentUser = await getCurrentUser()
      await refreshToken(currentUser, true)
      currentStore.value = response
      return response
    } finally {
      isLoading.value = false
    }
  }

  return {
    currentStore,
    isLoading,
    registerStore,
  }
})

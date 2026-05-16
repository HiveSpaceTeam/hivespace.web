import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAppStore } from '@hivespace/shared'
import { paymentService } from '@/services/payment.service'
import type { PaymentDto } from '@/types'

export const usePaymentStore = defineStore('payment', () => {
  const payment = ref<PaymentDto | null>(null)
  const isLoading = ref(false)

  const fetchPaymentByOrder = async (orderId: string) => {
    const appStore = useAppStore()
    isLoading.value = true
    appStore.setLoading(true)
    try {
      const response = await paymentService.getPaymentByOrder(orderId)
      payment.value = response
      return response
    } finally {
      isLoading.value = false
      appStore.setLoading(false)
    }
  }

  const resetPayment = () => {
    payment.value = null
  }

  return {
    payment,
    isLoading,
    fetchPaymentByOrder,
    resetPayment,
  }
})

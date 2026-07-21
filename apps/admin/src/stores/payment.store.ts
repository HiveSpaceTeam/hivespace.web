import type { PaymentDetail } from '@hivespace/shared'
import { useAppStore } from '@hivespace/shared'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { paymentService } from '@/services/payment.service'

export const usePaymentStore = defineStore('payment', () => {
  const payment = ref<PaymentDetail | null>(null)
  const isLoading = ref(false)

  const fetchPaymentByReference = async (referenceNo: string) => {
    const appStore = useAppStore()

    try {
      isLoading.value = true
      appStore.setLoading(true)
      payment.value = await paymentService.getPaymentByReference(referenceNo)
      return payment.value
    } finally {
      isLoading.value = false
      appStore.setLoading(false)
    }
  }

  const fetchPaymentByOrder = async (orderId: string) => {
    const appStore = useAppStore()

    try {
      isLoading.value = true
      appStore.setLoading(true)
      payment.value = await paymentService.getPaymentByOrder(orderId)
      return payment.value
    } finally {
      isLoading.value = false
      appStore.setLoading(false)
    }
  }

  const clearPayment = () => {
    payment.value = null
  }

  return {
    payment,
    isLoading,
    fetchPaymentByReference,
    fetchPaymentByOrder,
    clearPayment,
  }
})

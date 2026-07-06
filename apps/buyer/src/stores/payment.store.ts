import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  normalizeCurrencyCode,
  type MoneyIssue,
  useAppStore,
} from '@hivespace/shared'
import { paymentService } from '@/services/payment.service'
import type { PaymentDto } from '@/types'

const resolveMoneyIssue = (
  currencyCode: string | null | undefined,
): MoneyIssue | null => (normalizeCurrencyCode(currencyCode) ? null : { code: 'missing_currency' })

const normalizePayment = (payment: PaymentDto): PaymentDto => ({
  ...payment,
  currencyCode: normalizeCurrencyCode(payment.currencyCode ?? payment.currency),
  moneyIssue: payment.moneyIssue ?? resolveMoneyIssue(payment.currencyCode ?? payment.currency),
})

export const usePaymentStore = defineStore('payment', () => {
  const payment = ref<PaymentDto | null>(null)
  const isLoading = ref(false)

  const fetchPaymentByOrder = async (orderId: string) => {
    const appStore = useAppStore()
    isLoading.value = true
    appStore.setLoading(true)
    try {
      const response = normalizePayment(await paymentService.getPaymentByOrder(orderId))
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

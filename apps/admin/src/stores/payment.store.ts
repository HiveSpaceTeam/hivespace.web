import type {
  MoneyDisplay,
  MoneyIssue,
  PaymentDetail,
  PaymentLinkedOrder,
  SupportedCurrencyCode,
} from '@hivespace/shared'
import { normalizeMoneyDisplay, useAppStore } from '@hivespace/shared'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { paymentService } from '@/services/payment.service'

type NormalizedPaymentLinkedOrder = Omit<PaymentLinkedOrder, 'amount' | 'currency' | 'currencyCode'> & {
  amount?: MoneyDisplay | null
  currency?: SupportedCurrencyCode | null
  currencyCode?: SupportedCurrencyCode | null
}

type NormalizedPaymentDetail = Omit<
  PaymentDetail,
  'amount' | 'currency' | 'currencyCode' | 'moneyIssue' | 'linkedOrders'
> & {
  amount: MoneyDisplay
  currency?: SupportedCurrencyCode | null
  currencyCode?: SupportedCurrencyCode | null
  moneyIssue?: MoneyIssue | null
  linkedOrders?: NormalizedPaymentLinkedOrder[]
}

const normalizeLinkedOrder = (
  order: PaymentLinkedOrder,
  payment: PaymentDetail,
): NormalizedPaymentLinkedOrder => ({
  ...order,
  amount: order.amount != null
    ? normalizeMoneyDisplay(order.amount, {
        currencyCode: order.currencyCode ?? order.currency ?? payment.currencyCode ?? payment.currency,
      })
    : null,
  currency: normalizeMoneyDisplay(order.amount ?? null, {
    currencyCode: order.currencyCode ?? order.currency ?? payment.currencyCode ?? payment.currency,
  }).currencyCode,
  currencyCode: normalizeMoneyDisplay(order.amount ?? null, {
    currencyCode: order.currencyCode ?? order.currency ?? payment.currencyCode ?? payment.currency,
  }).currencyCode,
})

const normalizePayment = (payment: PaymentDetail): NormalizedPaymentDetail => {
  const amount = normalizeMoneyDisplay(payment.amount, {
    currencyCode: payment.currencyCode ?? payment.currency,
    issue: payment.moneyIssue ?? null,
  })

  return {
    ...payment,
    amount,
    currency: amount.currencyCode,
    currencyCode: amount.currencyCode,
    moneyIssue: amount.issue ?? null,
    linkedOrders: payment.linkedOrders?.map((order) => normalizeLinkedOrder(order, payment)),
  }
}

export const usePaymentStore = defineStore('payment', () => {
  const payment = ref<NormalizedPaymentDetail | null>(null)
  const isLoading = ref(false)

  const fetchPaymentByReference = async (referenceNo: string) => {
    const appStore = useAppStore()

    try {
      isLoading.value = true
      appStore.setLoading(true)
      payment.value = normalizePayment(await paymentService.getPaymentByReference(referenceNo))
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
      payment.value = normalizePayment(await paymentService.getPaymentByOrder(orderId))
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

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createMoneyDisplay,
  normalizeCurrencyCode,
  type MoneyIssue,
  useAppStore,
} from '@hivespace/shared'
import { paymentService } from '@/services/payment.service'
import type { PaymentDetail, PaymentDto } from '@/types'

const resolveMoneyIssue = (
  currencyCode: string | null | undefined,
): MoneyIssue | null => (normalizeCurrencyCode(currencyCode) ? null : { code: 'missing_currency' })

const normalizePayment = (payment: PaymentDetail): PaymentDto => {
  const amount = typeof payment.amount === 'number'
    ? createMoneyDisplay(payment.amount, payment.currencyCode ?? payment.currency)
    : payment.amount
  const currencyCode = normalizeCurrencyCode(amount.currencyCode ?? payment.currencyCode ?? payment.currency)
  const gateway = typeof payment.gateway === 'string' ? payment.gateway : payment.gateway?.code ?? null
  const gatewayTransactionId = typeof payment.gateway === 'string'
    ? payment.gatewayTransactionId ?? null
    : payment.gateway?.gatewayTransactionId ?? payment.gatewayTransactionId ?? null

  return {
    id: payment.id ?? payment.paymentId ?? '',
    paymentId: payment.paymentId ?? payment.id,
    referenceNo: payment.referenceNo ?? null,
    orderId: payment.orderId ?? payment.linkedOrders?.[0]?.orderId ?? null,
    buyerId: payment.buyerId ?? null,
    amount: amount.amount ?? 0,
    currency: payment.currency ?? amount.currencyCode ?? null,
    currencyCode,
    moneyIssue: amount.issue ?? payment.moneyIssue ?? resolveMoneyIssue(currencyCode),
    status: payment.status,
    methodCode: payment.methodCode ?? payment.method?.code ?? payment.latestAttempt?.methodCode ?? null,
    method: payment.method ?? null,
    gateway,
    gatewayTransactionId,
    gatewayPaymentUrl: payment.gatewayPaymentUrl ?? payment.latestAttempt?.redirectUrl ?? null,
    latestAttempt: payment.latestAttempt ?? null,
    attempts: payment.attempts ?? [],
    linkedOrders: payment.linkedOrders ?? [],
    paidAt: payment.paidAt ?? payment.latestAttempt?.completedAt ?? null,
    expiresAt: payment.expiresAt ?? payment.latestAttempt?.expiresAt ?? null,
    createdAt: payment.createdAt ?? payment.latestAttempt?.createdAt ?? null,
  }
}

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

  const fetchPaymentByReference = async (referenceNo: string) => {
    const appStore = useAppStore()
    isLoading.value = true
    appStore.setLoading(true)
    try {
      const response = normalizePayment(await paymentService.getPaymentByReference(referenceNo))
      payment.value = response
      return response
    } finally {
      isLoading.value = false
      appStore.setLoading(false)
    }
  }

  const fetchPaymentDetail = async (paymentId: string) => {
    const appStore = useAppStore()
    isLoading.value = true
    appStore.setLoading(true)
    try {
      const response = normalizePayment(await paymentService.getPaymentDetail(paymentId))
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
    fetchPaymentByReference,
    fetchPaymentDetail,
    resetPayment,
  }
})

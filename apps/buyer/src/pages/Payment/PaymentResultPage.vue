<template>
  <div class="min-h-screen flex flex-col bg-[#f5f5f5] dark:bg-surface-dark">
    <StorefrontHeader />

    <!-- Main -->
    <main class="flex-grow flex items-center justify-center py-12 px-4">
      <div class="bg-white dark:bg-card-dark rounded-sm shadow-sm p-8 w-full max-w-md text-center">

        <!-- Loading / Polling -->
        <template v-if="pageState === 'loading'">
          <div class="flex justify-center mb-4">
            <Spinner size="lg" />
          </div>
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
            {{ t('payment.verifying') }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('payment.verifyingSubtext') }}</p>
        </template>

        <!-- Success -->
        <template v-else-if="pageState === 'success'">
          <div class="flex justify-center mb-4">
            <CheckCircle class="w-14 h-14 text-green-500" />
          </div>
          <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
            {{ t('payment.successTitle') }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">{{ t('payment.successSubtext') }}</p>

          <div class="text-left space-y-3 border border-gray-100 dark:border-gray-700 rounded-sm p-4 mb-6 text-sm">
            <div v-if="displayPaymentReference" class="flex justify-between gap-2">
              <span class="text-gray-500 dark:text-gray-400">{{ t('payment.referenceNo') }}</span>
              <span class="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[180px]">{{ displayPaymentReference }}</span>
            </div>
            <div v-else-if="displayOrderId" class="flex justify-between gap-2">
              <span class="text-gray-500 dark:text-gray-400">{{ t('payment.orderReference') }}</span>
              <span class="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[180px]">{{ displayOrderId }}</span>
            </div>
            <div class="flex justify-between gap-2">
              <span class="text-gray-500 dark:text-gray-400">{{ t('payment.amountPaid') }}</span>
              <span class="font-semibold text-green-600">{{ formattedAmount }}</span>
            </div>
            <div v-if="payment?.gatewayTransactionId" class="flex justify-between gap-2">
              <span class="text-gray-500 dark:text-gray-400">{{ t('payment.transactionId') }}</span>
              <span class="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[180px]">{{ payment.gatewayTransactionId }}</span>
            </div>
            <div v-if="payment?.paidAt" class="flex justify-between gap-2">
              <span class="text-gray-500 dark:text-gray-400">{{ t('payment.paidAt') }}</span>
              <span class="font-medium text-gray-800 dark:text-gray-200">{{ formattedPaidAt }}</span>
            </div>
          </div>

          <RouterLink
            to="/"
            class="inline-block w-full bg-primary text-white text-sm font-semibold py-2.5 rounded-sm hover:bg-primary/90 transition-colors"
          >
            {{ t('payment.continueShopping') }}
          </RouterLink>
        </template>

        <!-- Terminal failure state -->
        <template v-else-if="pageState === 'failed'">
          <div class="flex justify-center mb-4">
            <XCircle class="w-14 h-14 text-red-500" />
          </div>
          <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
            {{ failedTitle }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">{{ failedSubtext }}</p>

          <div class="flex flex-col gap-2">
            <RouterLink
              to="/checkout"
              class="inline-block w-full bg-primary text-white text-sm font-semibold py-2.5 rounded-sm hover:bg-primary/90 transition-colors"
            >
              {{ t('payment.tryAgain') }}
            </RouterLink>
            <RouterLink
              to="/"
              class="inline-block w-full bg-white dark:bg-card-dark text-gray-700 dark:text-gray-300 text-sm font-semibold py-2.5 rounded-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {{ t('payment.goHome') }}
            </RouterLink>
          </div>
        </template>

        <!-- Timeout / Still Pending -->
        <template v-else-if="pageState === 'timeout'">
          <div class="flex justify-center mb-4">
            <Clock class="w-14 h-14 text-yellow-500" />
          </div>
          <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
            {{ t('payment.pendingTitle') }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">{{ t('payment.pendingSubtext') }}</p>

          <div class="flex flex-col gap-2">
            <button
              class="w-full bg-primary text-white text-sm font-semibold py-2.5 rounded-sm hover:bg-primary/90 transition-colors"
              @click="manualRefresh"
            >
              {{ t('payment.refresh') }}
            </button>
            <RouterLink
              to="/"
              class="inline-block w-full bg-white dark:bg-card-dark text-gray-700 dark:text-gray-300 text-sm font-semibold py-2.5 rounded-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {{ t('payment.goHome') }}
            </RouterLink>
          </div>
        </template>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  PAYMENT_STATUS,
  PENDING_PAYMENT_SESSION_KEY,
  Spinner,
  createMoneyDisplay,
  normalizePaymentStatus,
  useMoneyFormatter,
} from '@hivespace/shared'
import { useRoute } from 'vue-router'
import StorefrontHeader from '@/components/layout/StorefrontHeader.vue'
import { useI18n } from 'vue-i18n'
import { CheckCircle, XCircle, Clock } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { usePaymentStore } from '@/stores'
import { isTerminalStatus } from '@/types'
import type { PaymentStatus } from '@/types'

const route = useRoute()
const { t, locale } = useI18n()
const { formatMoney } = useMoneyFormatter({ t })

type PageState = 'loading' | 'success' | 'failed' | 'timeout'

const pageState = ref<PageState>('loading')
const failedStatus = ref<PaymentStatus | null>(null)
const pollCount = ref(0)
const MAX_POLLS = 20
let pollTimer: ReturnType<typeof setTimeout> | null = null
const paymentStore = usePaymentStore()
const { payment } = storeToRefs(paymentStore)

const pendingPayment = (() => {
  try {
    const raw = sessionStorage.getItem(PENDING_PAYMENT_SESSION_KEY)
    return raw ? JSON.parse(raw) as {
      paymentId?: string | null
      paymentReferenceNo?: string | null
      orderIds?: string[]
    } : null
  } catch {
    return null
  }
})()

const orderId = (route.query.orderId as string | undefined) ?? pendingPayment?.orderIds?.[0]
const paymentId = (route.query.paymentId as string | undefined) ?? pendingPayment?.paymentId ?? undefined
const paymentReferenceNo =
  (route.query.paymentReferenceNo as string | undefined)
  ?? (route.query.referenceNo as string | undefined)
  ?? pendingPayment?.paymentReferenceNo
const routeStatus = normalizePaymentStatus(route.query.status as string | undefined)

const displayOrderId = computed(() => payment.value?.orderId ?? orderId ?? null)
const displayPaymentReference = computed(() => payment.value?.referenceNo ?? paymentReferenceNo ?? null)

const formattedAmount = computed(() => {
  if (!payment.value) return ''
  return formatMoney(createMoneyDisplay(payment.value.amount, payment.value.currencyCode ?? payment.value.currency, {
    issue: payment.value.moneyIssue,
  }), { locale: locale.value })
})

const formattedPaidAt = computed(() => {
  if (!payment.value?.paidAt) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(payment.value.paidAt))
})

const failedTitle = computed(() => {
  switch (failedStatus.value) {
    case PAYMENT_STATUS.Cancelled: return t('payment.cancelledTitle')
    case PAYMENT_STATUS.Expired:   return t('payment.expiredTitle')
    default:          return t('payment.failedTitle')
  }
})

const failedSubtext = computed(() => {
  switch (failedStatus.value) {
    case PAYMENT_STATUS.Cancelled: return t('payment.cancelledSubtext')
    case PAYMENT_STATUS.Expired:   return t('payment.expiredSubtext')
    default:          return t('payment.failedSubtext')
  }
})

async function fetchAndEvaluate() {
  if (!paymentReferenceNo && !paymentId && !orderId) {
    failedStatus.value = routeStatus && routeStatus !== PAYMENT_STATUS.Succeeded ? routeStatus : null
    pageState.value = routeStatus === PAYMENT_STATUS.Succeeded ? 'success' : 'failed'
    return
  }
  try {
    const result = paymentReferenceNo
      ? await paymentStore.fetchPaymentByReference(paymentReferenceNo)
      : paymentId
        ? await paymentStore.fetchPaymentDetail(paymentId)
        : await paymentStore.fetchPaymentByOrder(orderId!)

    if (isTerminalStatus(result.status)) {
      failedStatus.value = result.status !== PAYMENT_STATUS.Succeeded ? result.status : null
      pageState.value = result.status === PAYMENT_STATUS.Succeeded ? 'success' : 'failed'
    } else {
      if (pollCount.value < MAX_POLLS) {
        pollCount.value++
        pollTimer = setTimeout(fetchAndEvaluate, 2000)
      } else {
        pageState.value = 'timeout'
      }
    }
  } catch {
    pageState.value = routeStatus === PAYMENT_STATUS.Succeeded ? 'success' : 'failed'
  }
}

function manualRefresh() {
  pollCount.value = 0
  pageState.value = 'loading'
  fetchAndEvaluate()
}

onMounted(() => fetchAndEvaluate())
onUnmounted(() => {
  if (pollTimer) clearTimeout(pollTimer)
  paymentStore.resetPayment()
  if (pageState.value === 'success') {
    sessionStorage.removeItem(PENDING_PAYMENT_SESSION_KEY)
  }
})
</script>

<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="$t('payments.byOrder.title')" />

    <div class="space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ $t('payments.byOrder.title') }}
        </h1>
        <RouterLink
          v-if="payment?.referenceNo"
          :to="{ name: 'Payments', query: { referenceNo: payment.referenceNo } }"
          class="text-sm font-medium text-brand-500 hover:underline">
          {{ $t('payments.byOrder.backToReference') }}
        </RouterLink>
      </div>

      <section class="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div v-if="paymentStore.isLoading" class="p-12 text-center">
          <Spinner />
        </div>

        <div v-else-if="payment" class="divide-y divide-gray-100 dark:divide-gray-800">
          <div class="grid gap-4 p-5 md:grid-cols-4">
            <div>
              <p class="text-xs uppercase text-gray-500">{{ $t('payments.detail.orderCode') }}</p>
              <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                {{ currentOrder?.orderCode ?? orderId }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">{{ $t('payments.detail.referenceNo') }}</p>
              <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                {{ payment.referenceNo ?? payment.id }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">{{ $t('payments.detail.method') }}</p>
              <p class="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                {{ displayPaymentMethod(payment) }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">{{ $t('payments.detail.status') }}</p>
              <p class="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                {{ displayPaymentStatus(payment.status) }}
              </p>
            </div>
          </div>

          <div class="grid gap-4 p-5 md:grid-cols-3">
            <div>
              <p class="text-xs uppercase text-gray-500">{{ $t('payments.detail.amount') }}</p>
              <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                {{ formatAmount(payment.amount) }}
              </p>
            </div>
            <div v-if="payment.latestAttempt">
              <p class="text-xs uppercase text-gray-500">{{ $t('payments.detail.latestAttempt') }}</p>
              <p class="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                {{ formatAttemptSummary(payment.latestAttempt) }}
              </p>
            </div>
            <div v-if="payment.latestAttempt?.gatewayTransactionId">
              <p class="text-xs uppercase text-gray-500">{{ $t('payments.detail.gatewayTransactionId') }}</p>
              <p class="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                {{ payment.latestAttempt.gatewayTransactionId }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="p-12 text-center text-sm text-gray-500">
          {{ $t('payments.byOrder.notFound') }}
        </div>
      </section>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  AppShell,
  PageBreadcrumb,
  Spinner,
  paymentStatusLabelKey,
  useMoneyFormatter,
} from '@hivespace/shared'
import type { MoneyDisplay, PaymentAttempt, PaymentDetail, PaymentStatus } from '@hivespace/shared'
import { usePaymentStore } from '@/stores/payment.store'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t, te, locale } = useI18n()
const paymentStore = usePaymentStore()
const { payment } = storeToRefs(paymentStore)
const { formatMoney } = useMoneyFormatter({ t })

const orderId = computed(() => String(route.params.orderId ?? ''))
const currentOrder = computed(() =>
  payment.value?.linkedOrders?.find(order => order.orderId === orderId.value) ?? null,
)

const formatAmount = (amount: MoneyDisplay) =>
  formatMoney(amount, { locale: locale.value })

const displayPaymentStatus = (status: PaymentStatus) => {
  const key = paymentStatusLabelKey(status)
  return te(key) ? t(key) : status
}

const displayPaymentMethod = (paymentDetail: PaymentDetail) =>
  paymentDetail.method?.displayName
  ?? paymentDetail.methodCode
  ?? paymentDetail.latestAttempt?.methodCode
  ?? t('common.emptyValue')

const formatAttemptSummary = (attempt: PaymentAttempt) =>
  t('payments.detail.attemptStatus', {
    attemptNo: attempt.attemptNo,
    status: displayPaymentStatus(attempt.status),
  })

onMounted(async () => {
  if (!orderId.value) {
    paymentStore.clearPayment()
    return
  }

  try {
    await paymentStore.fetchPaymentByOrder(orderId.value)
  } catch {
    paymentStore.clearPayment()
  }
})
</script>

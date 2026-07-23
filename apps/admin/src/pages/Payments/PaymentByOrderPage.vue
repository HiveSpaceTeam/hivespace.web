<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="$t('payments.byOrder.title')" />

    <div class="space-y-4">
      <div class="flex items-center">
        <RouterLink
          :to="referenceLookupRoute"
          :aria-label="$t('payments.byOrder.backToReference')"
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white">
          <BackArrowIcon class="h-4 w-4" />
        </RouterLink>
      </div>

      <section class="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div v-if="paymentStore.isLoading" class="p-12 text-center">
          <Spinner />
        </div>

        <div v-else-if="payment" class="grid gap-6 p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <div class="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
            <p class="text-xs font-medium uppercase text-gray-500">{{ $t('payments.detail.amount') }}</p>
            <p class="mt-2 break-words text-2xl font-semibold text-gray-900 dark:text-white">
              {{ formatAmount(payment.amount) }}
            </p>
            <div class="mt-4 flex flex-wrap items-center gap-3">
              <Badge size="sm" :color="statusBadgeColor(payment.status)" dot>
                {{ displayPaymentStatus(payment.status) }}
              </Badge>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ displayPaymentMethod(payment) }}
              </span>
            </div>
          </div>

          <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <p class="text-xs font-medium uppercase text-gray-500">{{ $t('payments.detail.orderCode') }}</p>
              <p class="mt-1 break-all text-sm font-semibold text-gray-900 dark:text-white">
                {{ currentOrder?.orderCode ?? orderId }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase text-gray-500">{{ $t('payments.detail.referenceNo') }}</p>
              <p class="mt-1 break-all text-sm font-semibold text-gray-900 dark:text-white">
                {{ payment.referenceNo ?? payment.id }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase text-gray-500">{{ $t('payments.detail.latestAttempt') }}</p>
              <p class="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                {{ payment.latestAttempt ? formatAttemptSummary(payment.latestAttempt) : $t('common.emptyValue') }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase text-gray-500">
                {{ $t('payments.detail.gatewayTransactionId') }}
              </p>
              <p class="mt-1 break-all text-sm font-medium text-gray-800 dark:text-gray-200">
                {{ payment.latestAttempt?.gatewayTransactionId ?? $t('common.emptyValue') }}
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
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  AppShell,
  BackArrowIcon,
  Badge,
  PageBreadcrumb,
  Spinner,
  paymentStatusLabelKey,
  useMoneyFormatter,
} from '@hivespace/shared'
import type { MoneyDisplay, PaymentAttempt, PaymentDetail, PaymentStatus } from '@hivespace/shared'
import { usePaymentStore } from '@/stores/payment.store'
import { useI18n } from 'vue-i18n'

type BadgeColor = 'success' | 'error' | 'warning' | 'info' | 'light'

const route = useRoute()
const { t, te, locale } = useI18n()
const paymentStore = usePaymentStore()
const { payment } = storeToRefs(paymentStore)
const { formatMoney } = useMoneyFormatter({ t })

const orderId = computed(() => String(route.params.orderId ?? ''))
const currentOrder = computed(() =>
  payment.value?.linkedOrders?.find(order => order.orderId === orderId.value) ?? null,
)
const referenceLookupRoute = computed(() =>
  payment.value?.referenceNo
    ? { name: 'Payments', query: { referenceNo: payment.value.referenceNo } }
    : { name: 'Payments' },
)

const formatAmount = (amount: MoneyDisplay) =>
  formatMoney(amount, { locale: locale.value })

const displayPaymentStatus = (status: PaymentStatus) => {
  const key = paymentStatusLabelKey(status)
  return te(key) ? t(key) : status
}

const statusBadgeColor = (status: PaymentStatus): BadgeColor => {
  const colors: Record<PaymentStatus, BadgeColor> = {
    Succeeded: 'success',
    Failed: 'error',
    Cancelled: 'light',
    Expired: 'warning',
    Processing: 'info',
    Pending: 'warning',
  }

  return colors[status] ?? 'light'
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

onBeforeUnmount(() => {
  paymentStore.clearPayment()
})
</script>

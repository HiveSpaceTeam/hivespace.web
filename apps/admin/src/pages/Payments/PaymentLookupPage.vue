<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="$t('payments.title')" />

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ $t('payments.breadcrumb') }}
        </h1>
      </div>

      <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <form class="flex flex-wrap items-end gap-3" @submit.prevent="handleLookup">
          <label class="min-w-[280px] flex-1">
            <span class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('payments.lookup.label') }}
            </span>
            <input
              v-model="referenceNo"
              type="text"
              :placeholder="$t('payments.lookup.placeholder')"
              class="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            />
          </label>
          <Button type="submit" variant="primary" size="sm" :disabled="!canSearch || paymentStore.isLoading">
            {{ $t('payments.lookup.action') }}
          </Button>
        </form>
      </section>

      <section class="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div v-if="paymentStore.isLoading" class="p-12 text-center">
          <Spinner />
        </div>

        <div v-else-if="payment" class="divide-y divide-gray-100 dark:divide-gray-800">
          <div class="grid gap-4 p-5 md:grid-cols-4">
            <div>
              <p class="text-xs uppercase text-gray-500">{{ $t('payments.detail.referenceNo') }}</p>
              <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                {{ payment.referenceNo ?? payment.id }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">{{ $t('payments.detail.status') }}</p>
              <p class="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                {{ displayPaymentStatus(payment.status) }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">{{ $t('payments.detail.method') }}</p>
              <p class="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                {{ displayPaymentMethod(payment) }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">{{ $t('payments.detail.amount') }}</p>
              <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                {{ formatAmount(payment.amount) }}
              </p>
            </div>
          </div>

          <div class="p-5">
            <h2 class="mb-3 text-base font-semibold text-gray-900 dark:text-white">
              {{ $t('payments.detail.linkedOrders') }}
            </h2>
            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b border-gray-100 text-left text-xs uppercase text-gray-500 dark:border-gray-800">
                    <th class="px-3 py-2">{{ $t('payments.detail.orderCode') }}</th>
                    <th class="px-3 py-2">{{ $t('payments.detail.storeId') }}</th>
                    <th class="px-3 py-2 text-right">{{ $t('payments.detail.amount') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="order in payment.linkedOrders ?? []"
                    :key="order.orderId"
                    class="border-b border-gray-50 text-sm dark:border-gray-800"
                  >
                    <td class="px-3 py-2 font-medium">
                      <RouterLink
                        :to="{ name: 'PaymentByOrder', params: { orderId: order.orderId } }"
                        class="text-brand-500 hover:underline">
                        {{ order.orderCode ?? order.orderId }}
                      </RouterLink>
                    </td>
                    <td class="px-3 py-2 text-gray-600 dark:text-gray-300">
                      {{ order.storeId ?? emptyValue }}
                    </td>
                    <td class="px-3 py-2 text-right text-gray-700 dark:text-gray-200">
                      {{ order.amount ? formatAmount(order.amount) : emptyValue }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="grid gap-5 p-5 lg:grid-cols-2">
            <PaymentAttemptPanel
              v-if="payment.latestAttempt"
              :title="$t('payments.detail.latestAttempt')"
              :attempts="[payment.latestAttempt]"
            />
            <PaymentAttemptPanel
              :title="$t('payments.detail.attemptHistory')"
              :attempts="payment.attempts ?? []"
            />
          </div>
        </div>

        <div v-else class="p-12 text-center text-sm text-gray-500">
          {{ hasSearched ? $t('payments.lookup.notFound') : $t('payments.lookup.empty') }}
        </div>
      </section>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  AppShell,
  Button,
  PAYMENT_DISPLAY_SEPARATOR,
  PageBreadcrumb,
  Spinner,
  paymentStatusLabelKey,
  useMoneyFormatter,
} from '@hivespace/shared'
import type { MoneyDisplay, PaymentAttempt, PaymentDetail, PaymentStatus } from '@hivespace/shared'
import { usePaymentStore } from '@/stores/payment.store'

const route = useRoute()
const { t, te, locale } = useI18n()
const paymentStore = usePaymentStore()
const { payment } = storeToRefs(paymentStore)
const { formatMoney } = useMoneyFormatter({ t })

const referenceNo = ref('')
const hasSearched = ref(false)

const canSearch = computed(() => referenceNo.value.trim().length > 0)
const emptyValue = computed(() => t('common.emptyValue'))
const queryReferenceNo = computed(() =>
  typeof route.query.referenceNo === 'string' ? route.query.referenceNo : '',
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
  ?? emptyValue.value

const formatAttemptNumber = (attemptNo: number) =>
  t('payments.detail.attemptNumber', { attemptNo })

const formatLabelValue = (label: string, value: string) =>
  t('payments.detail.labelValue', { label, value })

const displayAttemptMethod = (attempt: PaymentAttempt) =>
  [attempt.methodCode, attempt.gatewayCode].filter(Boolean).join(PAYMENT_DISPLAY_SEPARATOR)

const lookupReference = async (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return

  referenceNo.value = trimmed
  hasSearched.value = true
  try {
    await paymentStore.fetchPaymentByReference(trimmed)
  } catch {
    paymentStore.clearPayment()
  }
}

const handleLookup = async () => {
  await lookupReference(referenceNo.value)
}

watch(
  queryReferenceNo,
  async value => {
    if (value && value !== referenceNo.value.trim()) {
      await lookupReference(value)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  paymentStore.clearPayment()
})

const PaymentAttemptPanel = defineComponent({
  name: 'PaymentAttemptPanel',
  props: {
    title: { type: String, required: true },
    attempts: { type: Array as PropType<PaymentAttempt[]>, required: true },
  },
  setup(props) {
    return () =>
      h('section', { class: 'rounded-lg border border-gray-100 p-4 dark:border-gray-800' }, [
        h('h3', { class: 'mb-3 text-sm font-semibold text-gray-900 dark:text-white' }, props.title),
        props.attempts.length === 0
          ? h('p', { class: 'text-sm text-gray-500' }, emptyValue.value)
          : h('div', { class: 'space-y-3' }, props.attempts.map((attempt) =>
              h('div', { key: attempt.id, class: 'rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-900' }, [
                h('div', { class: 'flex items-center justify-between gap-3' }, [
                  h('span', { class: 'font-medium text-gray-900 dark:text-white' }, formatAttemptNumber(attempt.attemptNo)),
                  h('span', { class: 'text-gray-600 dark:text-gray-300' }, displayPaymentStatus(attempt.status)),
                ]),
                h('p', { class: 'mt-1 text-gray-500' }, displayAttemptMethod(attempt)),
                attempt.gatewayTransactionId
                  ? h('p', { class: 'mt-1 text-gray-500' }, formatLabelValue(t('payments.detail.gatewayTransactionId'), attempt.gatewayTransactionId))
                  : null,
                attempt.failureReasonCode
                  ? h('p', { class: 'mt-1 text-gray-500' }, formatLabelValue(t('payments.detail.failureReason'), attempt.failureReasonCode))
                  : null,
                h('p', { class: 'mt-1 text-gray-500' }, formatLabelValue(t('payments.detail.createdAt'), attempt.createdAt)),
                attempt.completedAt
                  ? h('p', { class: 'mt-1 text-gray-500' }, formatLabelValue(t('payments.detail.completedAt'), attempt.completedAt))
                  : null,
              ]),
            )),
      ])
  },
})
</script>

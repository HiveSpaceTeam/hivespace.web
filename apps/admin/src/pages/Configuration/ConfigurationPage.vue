<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="$t('configuration.title')" />

    <div class="flex min-h-0 flex-1 gap-6">
      <!-- Settings Rail -->
      <aside class="w-60 shrink-0 overflow-y-auto">
        <Input
          v-model="railSearch"
          :placeholder="$t('configuration.searchPlaceholder')"
          class="mb-4"
        />
        <nav>
          <div v-for="group in filteredRailGroups" :key="group.title" class="mb-4">
            <p class="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{{ group.title }}</p>
            <ul>
              <li v-for="item in group.items" :key="item.id">
                <a
                  :href="`#${item.id}`"
                  @click.prevent="setSection(item.id)"
                  :class="[
                    'flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors',
                    activeSection === item.id
                      ? 'bg-brand-50 font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-white',
                  ]"
                >
                  <component :is="item.icon" class="h-4 w-4 shrink-0" />
                  {{ item.label }}
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <!-- Content: independently scrollable -->
      <div class="min-h-0 flex-1 space-y-5 overflow-y-auto pb-24">
        <!-- Payments -->
        <section v-show="activeSection === 'payments'" class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">{{ $t('configuration.payments.title') }}</h2>

          <!-- Provider cards -->
          <div class="mb-6 grid grid-cols-2 gap-3">
            <div
              v-for="provider in paymentProviders"
              :key="provider.id"
              :class="[
                'flex items-center justify-between rounded-xl border p-4 transition-colors',
                providerEnabled[provider.id]
                  ? 'border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-500/15'
                  : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]',
              ]"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                  :style="{ background: provider.color }"
                >
                  {{ provider.abbr }}
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ provider.name }}</p>
                  <p class="text-xs text-gray-400 dark:text-gray-500">{{ provider.sub }}</p>
                </div>
              </div>
              <ToggleSwitch v-model="providerEnabled[provider.id]" @update:modelValue="markChanged" />
            </div>
          </div>

          <!-- Platform fee table -->
          <div class="mb-6">
            <p class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('configuration.payments.platformFee') }}</p>
            <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-400">
                    <th class="px-4 py-2.5">{{ $t('configuration.payments.table.tier') }}</th>
                    <th class="px-4 py-2.5">{{ $t('configuration.payments.table.feeRate') }}</th>
                    <th class="px-4 py-2.5">{{ $t('configuration.payments.table.minThreshold') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in feeTable" :key="row.tier" class="border-t border-gray-100 dark:border-gray-800">
                    <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300">{{ $t('configuration.payments.table.tier') }} {{ row.tier }}</td>
                    <td class="px-4 py-2.5">
                      <div class="w-20">
                        <Input v-model="row.fee" @update:modelValue="markChanged" type="text" />
                      </div>
                    </td>
                    <td class="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">
                      {{ $t(`configuration.payments.thresholds.${row.thresholdKey}`) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Payout schedule -->
          <div class="mb-6">
            <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('configuration.payments.payoutSchedule') }}</p>
            <Tabs v-model="payoutSchedule" :options="payoutTabOptions" variant="pills" @update:modelValue="markChanged" />
          </div>

          <!-- Behavior toggles -->
          <div class="space-y-3">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Behavior</p>
            <div
              v-for="toggle in paymentToggles"
              :key="toggle.key"
              class="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 dark:border-gray-800"
            >
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ toggle.label }}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500">{{ toggle.sub }}</p>
              </div>
              <ToggleSwitch v-model="paymentToggleValues[toggle.key]" @update:modelValue="markChanged" />
            </div>
          </div>
        </section>

        <!-- Tax -->
        <section v-show="activeSection === 'tax'" class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">{{ $t('configuration.tax.title') }}</h2>
          <div class="grid grid-cols-2 gap-4">
            <Input
              v-model="taxId"
              :label="$t('configuration.tax.taxId')"
              :placeholder="$t('configuration.tax.taxIdPlaceholder')"
              @update:modelValue="markChanged"
            />
            <Input
              v-model="vatRate"
              :label="$t('configuration.tax.vatRate')"
              :placeholder="$t('configuration.tax.vatRatePlaceholder')"
              type="number"
              @update:modelValue="markChanged"
            />
          </div>
        </section>

        <!-- Localization -->
        <section v-show="activeSection === 'localization'" class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">{{ $t('configuration.localization.title') }}</h2>

          <div class="mb-6">
            <div class="mb-3 flex items-center justify-between">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('configuration.localization.currencies') }}
              </p>
              <p v-if="editableCurrencyConfig" class="text-xs text-gray-500 dark:text-gray-400">
                {{ $t('configuration.localization.version', { version: editableCurrencyConfig.version }) }}
              </p>
            </div>

            <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <div
                v-for="currency in currencyRows"
                :key="currency.currencyCode"
                class="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-b-0 dark:border-gray-800"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ currency.currencyCode }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{
                      currency.enabled
                        ? $t('configuration.localization.enabled')
                        : $t('configuration.localization.disabled')
                    }}
                    <span
                      v-if="editableCurrencyConfig?.defaultCurrencyCode === currency.currencyCode"
                      class="ml-1"
                    >
                      {{ $t('configuration.localization.default') }}
                    </span>
                  </p>
                </div>
                <ToggleSwitch
                  :modelValue="currency.enabled"
                  @update:modelValue="updateCurrencyEnabled(currency.currencyCode, $event)"
                />
              </div>
            </div>

            <p v-if="validationError" class="mt-3 text-sm text-error-600 dark:text-error-400">
              {{ $t(validationError) }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <Select
              :modelValue="editableCurrencyConfig?.defaultCurrencyCode ?? null"
              :options="defaultCurrencyOptions"
              :label="$t('configuration.localization.defaultCurrency')"
              @update:modelValue="updateDefaultCurrency"
            />
            <Select
              v-model="language"
              :options="languageOptions"
              :label="$t('configuration.localization.language')"
              @update:modelValue="markChanged"
            />
            <Select
              v-model="timezone"
              :options="timezoneOptions"
              :label="$t('configuration.localization.timezone')"
              @update:modelValue="markChanged"
            />
          </div>
        </section>

        <!-- API & Webhooks -->
        <section v-show="activeSection === 'api'" class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">{{ $t('configuration.api.title') }}</h2>
          <div class="space-y-4">
            <Input
              v-model="apiEndpoint"
              :label="$t('configuration.api.endpoint')"
              @update:modelValue="markChanged"
              type="text"
            />
            <div>
              <p class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('configuration.api.apiKey') }}</p>
              <div class="flex gap-2">
                <Input
                  :type="showApiKey ? 'text' : 'password'"
                  v-model="apiKey"
                  @update:modelValue="markChanged"
                  class="flex-1"
                />
                <Button variant="outline" size="sm" @click="showApiKey = !showApiKey">
                  {{ showApiKey ? $t('configuration.api.hide') : $t('configuration.api.show') }}
                </Button>
              </div>
            </div>
            <Input
              v-model="webhookUrl"
              :label="$t('configuration.api.webhookUrl')"
              @update:modelValue="markChanged"
              type="text"
            />

            <!-- Delivery mode toggles -->
            <div class="space-y-3 pt-2">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('configuration.api.deliveryMode') }}</p>
              <div
                v-for="wt in webhookToggles"
                :key="wt.key"
                class="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 dark:border-gray-800"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ wt.label }}</p>
                  <p class="text-xs text-gray-400 dark:text-gray-500">{{ wt.sub }}</p>
                </div>
                <ToggleSwitch v-model="webhookToggleValues[wt.key]" @update:modelValue="markChanged" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Sticky Save Bar -->
    <Teleport to="body">
      <div v-if="hasChanges" class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div class="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
            <span class="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
          </span>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ $t('configuration.saveBar.unsavedChanges', { count: changeCount }) }}
          </span>
          <Button variant="outline" size="sm" @click="discard">{{ $t('configuration.saveBar.discard') }}</Button>
          <Button variant="primary" size="sm" @click="save">{{ $t('configuration.saveBar.save') }}</Button>
        </div>
      </div>
    </Teleport>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import {
  AppShell, PageBreadcrumb, ToggleSwitch, useAppStore,
  PaymentIcon, SettingsIcon, PlugInIcon, ListIcon,
  Tabs, Button, Input, Select,
} from '@hivespace/shared'
import type { SupportedCurrencyCode } from '@/types'
import { useConfigurationStore } from '@/stores/configuration.store'

const { t } = useI18n()
const appStore = useAppStore()
const configurationStore = useConfigurationStore()
const {
  editableCurrencyConfig,
  validationError,
  enabledCurrencyOptions,
} = storeToRefs(configurationStore)

const railSearch = ref('')
const activeSection = ref('localization')

const railGroups = computed(() => [
  {
    title: t('configuration.nav.workspace'),
    items: [
      { id: 'localization', label: t('configuration.tabs.localization'), icon: SettingsIcon },
      { id: 'api',          label: t('configuration.tabs.api'),          icon: PlugInIcon },
    ],
  },
  {
    title: t('configuration.nav.commerce'),
    items: [
      { id: 'payments', label: t('configuration.tabs.payments'), icon: PaymentIcon },
      { id: 'tax',      label: t('configuration.tabs.tax'),      icon: ListIcon },
    ],
  },
])

const filteredRailGroups = computed(() => {
  if (!railSearch.value) return railGroups.value
  const q = railSearch.value.toLowerCase()
  return railGroups.value
    .map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) }))
    .filter((g) => g.items.length > 0)
})

const setSection = (id: string) => {
  activeSection.value = id
}

interface FeeTableRow {
  fee: string
  thresholdKey: string
  tier: number
}

interface NonCurrencyConfigurationDraft {
  apiEndpoint: string
  apiKey: string
  feeTable: FeeTableRow[]
  language: string
  paymentToggleValues: Record<string, boolean>
  payoutSchedule: string
  providerEnabled: Record<string, boolean>
  taxId: string
  timezone: string
  vatRate: string
  webhookToggleValues: Record<string, boolean>
  webhookUrl: string
}

const markChanged = () => undefined

// Provider state separated from display data
const providerEnabled = ref<Record<string, boolean>>({
  vnpay: true,
  momo: true,
  stripe: false,
  zalopay: true,
})

const paymentProviders = computed(() => [
  { id: 'vnpay',   name: t('configuration.payments.providers.vnpay'),   sub: t('configuration.payments.providers.vnpayDesc'),   abbr: 'VP', color: '#1e40af' },
  { id: 'momo',    name: t('configuration.payments.providers.momo'),    sub: t('configuration.payments.providers.momoDesc'),    abbr: 'MM', color: '#9333ea' },
  { id: 'stripe',  name: t('configuration.payments.providers.stripe'),  sub: t('configuration.payments.providers.stripeDesc'),  abbr: 'ST', color: '#4f46e5' },
  { id: 'zalopay', name: t('configuration.payments.providers.zalopay'), sub: t('configuration.payments.providers.zalopayDesc'), abbr: 'ZP', color: '#0369a1' },
])

const feeTable = ref<FeeTableRow[]>([
  { tier: 1, fee: '2.5%', thresholdKey: 't1' },
  { tier: 2, fee: '3.0%', thresholdKey: 't2' },
  { tier: 3, fee: '3.5%', thresholdKey: 't3' },
  { tier: 4, fee: '4.0%', thresholdKey: 't4' },
])

const payoutSchedule = ref('Weekly')

const payoutTabOptions = computed(() => [
  { label: t('configuration.payments.payout.daily'),   value: 'Daily' },
  { label: t('configuration.payments.payout.weekly'),  value: 'Weekly' },
  { label: t('configuration.payments.payout.monthly'), value: 'Monthly' },
])

// Payment toggle state separated from display data
const paymentToggleValues = ref<Record<string, boolean>>({
  auto_refund:   true,
  split_payment: false,
  fraud_block:   true,
  escrow:        true,
})

const paymentToggles = computed(() => [
  { key: 'auto_refund',   label: t('configuration.payments.toggles.autoRefund'),   sub: t('configuration.payments.toggles.autoRefundDesc') },
  { key: 'split_payment', label: t('configuration.payments.toggles.splitPayment'), sub: t('configuration.payments.toggles.splitPaymentDesc') },
  { key: 'fraud_block',   label: t('configuration.payments.toggles.fraudBlock'),   sub: t('configuration.payments.toggles.fraudBlockDesc') },
  { key: 'escrow',        label: t('configuration.payments.toggles.escrowHold'),   sub: t('configuration.payments.toggles.escrowHoldDesc') },
])

const taxId = ref('0312345678')
const vatRate = ref('10')

const language = ref('vi')
const timezone = ref('Asia/Ho_Chi_Minh')

const languageOptions = computed(() => [
  { value: 'vi', label: t('configuration.localization.languages.vi') },
  { value: 'en', label: t('configuration.localization.languages.en') },
])

const timezoneOptions = computed(() => [
  { value: 'Asia/Ho_Chi_Minh', label: t('configuration.localization.timezones.hcm') },
  { value: 'UTC',              label: t('configuration.localization.timezones.utc') },
  { value: 'Asia/Singapore',   label: t('configuration.localization.timezones.sg') },
])

const apiEndpoint = ref('https://api.hivespace.vn/v1')
const apiKey = ref('hsk_live_xxxxxxxxxxxxxxxxxxx')
const showApiKey = ref(false)
const webhookUrl = ref('https://hooks.hivespace.vn/events')

// Webhook toggle state separated from display data
const webhookToggleValues = ref<Record<string, boolean>>({
  retry: true,
  async: true,
})

const webhookToggles = computed(() => [
  { key: 'retry', label: t('configuration.api.toggles.autoRetry'),     sub: t('configuration.api.toggles.autoRetryDesc') },
  { key: 'async', label: t('configuration.api.toggles.asyncDelivery'), sub: t('configuration.api.toggles.asyncDeliveryDesc') },
])

const currencyRows = computed(() => editableCurrencyConfig.value?.items ?? [])

const cloneDraft = (draft: NonCurrencyConfigurationDraft): NonCurrencyConfigurationDraft => ({
  apiEndpoint: draft.apiEndpoint,
  apiKey: draft.apiKey,
  feeTable: draft.feeTable.map((row: FeeTableRow) => ({ ...row })),
  language: draft.language,
  paymentToggleValues: { ...draft.paymentToggleValues },
  payoutSchedule: draft.payoutSchedule,
  providerEnabled: { ...draft.providerEnabled },
  taxId: draft.taxId,
  timezone: draft.timezone,
  vatRate: draft.vatRate,
  webhookToggleValues: { ...draft.webhookToggleValues },
  webhookUrl: draft.webhookUrl,
})

const getCurrentDraft = (): NonCurrencyConfigurationDraft => ({
  apiEndpoint: apiEndpoint.value,
  apiKey: apiKey.value,
  feeTable: feeTable.value.map((row: FeeTableRow) => ({ ...row })),
  language: language.value,
  paymentToggleValues: { ...paymentToggleValues.value },
  payoutSchedule: payoutSchedule.value,
  providerEnabled: { ...providerEnabled.value },
  taxId: taxId.value,
  timezone: timezone.value,
  vatRate: vatRate.value,
  webhookToggleValues: { ...webhookToggleValues.value },
  webhookUrl: webhookUrl.value,
})

const initialDraft = ref<NonCurrencyConfigurationDraft>(cloneDraft(getCurrentDraft()))

const restoreDraft = (draft: NonCurrencyConfigurationDraft) => {
  apiEndpoint.value = draft.apiEndpoint
  apiKey.value = draft.apiKey
  feeTable.value = draft.feeTable.map((row: FeeTableRow) => ({ ...row }))
  language.value = draft.language
  paymentToggleValues.value = { ...draft.paymentToggleValues }
  payoutSchedule.value = draft.payoutSchedule
  providerEnabled.value = { ...draft.providerEnabled }
  taxId.value = draft.taxId
  timezone.value = draft.timezone
  vatRate.value = draft.vatRate
  webhookToggleValues.value = { ...draft.webhookToggleValues }
  webhookUrl.value = draft.webhookUrl
}

const countBooleanRecordDifferences = (
  left: Record<string, boolean>,
  right: Record<string, boolean>,
) => {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)])
  let count = 0

  keys.forEach((key) => {
    if (left[key] !== right[key]) {
      count += 1
    }
  })

  return count
}

const nonCurrencyChangeCount = computed(() => {
  const currentDraft = getCurrentDraft()
  const persistedDraft = initialDraft.value
  let count = 0

  count += countBooleanRecordDifferences(currentDraft.providerEnabled, persistedDraft.providerEnabled)
  count += countBooleanRecordDifferences(
    currentDraft.paymentToggleValues,
    persistedDraft.paymentToggleValues,
  )
  count += countBooleanRecordDifferences(
    currentDraft.webhookToggleValues,
    persistedDraft.webhookToggleValues,
  )

  currentDraft.feeTable.forEach((row: FeeTableRow, index: number) => {
    if (
      row.fee !== persistedDraft.feeTable[index]?.fee ||
      row.thresholdKey !== persistedDraft.feeTable[index]?.thresholdKey ||
      row.tier !== persistedDraft.feeTable[index]?.tier
    ) {
      count += 1
    }
  })

  if (currentDraft.payoutSchedule !== persistedDraft.payoutSchedule) count += 1
  if (currentDraft.taxId !== persistedDraft.taxId) count += 1
  if (currentDraft.vatRate !== persistedDraft.vatRate) count += 1
  if (currentDraft.language !== persistedDraft.language) count += 1
  if (currentDraft.timezone !== persistedDraft.timezone) count += 1
  if (currentDraft.apiEndpoint !== persistedDraft.apiEndpoint) count += 1
  if (currentDraft.apiKey !== persistedDraft.apiKey) count += 1
  if (currentDraft.webhookUrl !== persistedDraft.webhookUrl) count += 1

  return count
})

const hasUnsupportedChanges = computed(() => nonCurrencyChangeCount.value > 0)
const hasChanges = computed(() => configurationStore.hasChanges || hasUnsupportedChanges.value)
const changeCount = computed(() => configurationStore.changeCount + nonCurrencyChangeCount.value)

const defaultCurrencyOptions = computed(() =>
  enabledCurrencyOptions.value.map((currencyCode: SupportedCurrencyCode) => ({
    value: currencyCode,
    label: currencyCode,
  })),
)

const updateDefaultCurrency = (currencyCode: string) => {
  configurationStore.setDefaultCurrency(currencyCode as SupportedCurrencyCode)
}

const updateCurrencyEnabled = (currencyCode: SupportedCurrencyCode, enabled: boolean) => {
  configurationStore.setCurrencyEnabled(currencyCode, enabled)
}

const discard = () => {
  configurationStore.discardChanges()
  restoreDraft(initialDraft.value)
}

const save = async () => {
  if (configurationStore.hasChanges) {
    const response = await configurationStore.saveCurrencyConfig()

    if (!response) {
      return
    }

    appStore.notifySuccess(t('configuration.notifications.saved'), t('configuration.notifications.version'))
  }

  if (hasUnsupportedChanges.value) {
    appStore.notifyInfo(
      t('configuration.notifications.pendingSettings'),
      t('configuration.notifications.pendingSettingsDescription'),
    )
  }
}

onMounted(() => {
  void configurationStore.fetchCurrencyConfig()
})
</script>

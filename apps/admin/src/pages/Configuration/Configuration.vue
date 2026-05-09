<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="$t('pages.configuration.title')" />

    <div class="flex min-h-0 flex-1 gap-6">
      <!-- Settings Rail -->
      <aside class="w-60 shrink-0 overflow-y-auto">
        <Input
          v-model="railSearch"
          :placeholder="$t('pages.configuration.searchPlaceholder')"
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
          <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">{{ $t('pages.configuration.payments.title') }}</h2>

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
            <p class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('pages.configuration.payments.platformFee') }}</p>
            <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-white/[0.03]">
                    <th class="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{{ $t('pages.configuration.payments.table.tier') }}</th>
                    <th class="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{{ $t('pages.configuration.payments.table.feeRate') }}</th>
                    <th class="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{{ $t('pages.configuration.payments.table.minThreshold') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in feeTable" :key="row.tier" class="border-t border-gray-100 dark:border-gray-800">
                    <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300">{{ $t('pages.configuration.payments.table.tier') }} {{ row.tier }}</td>
                    <td class="px-4 py-2.5">
                      <div class="w-20">
                        <Input v-model="row.fee" @update:modelValue="markChanged" type="text" />
                      </div>
                    </td>
                    <td class="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">{{ row.threshold }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Payout schedule -->
          <div class="mb-6">
            <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('pages.configuration.payments.payoutSchedule') }}</p>
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
          <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">{{ $t('pages.configuration.tax.title') }}</h2>
          <div class="grid grid-cols-2 gap-4">
            <Input
              v-model="taxId"
              :label="$t('pages.configuration.tax.taxId')"
              :placeholder="$t('pages.configuration.tax.taxIdPlaceholder')"
              @update:modelValue="markChanged"
            />
            <Input
              v-model="vatRate"
              :label="$t('pages.configuration.tax.vatRate')"
              :placeholder="$t('pages.configuration.tax.vatRatePlaceholder')"
              type="number"
              @update:modelValue="markChanged"
            />
          </div>
        </section>

        <!-- Localization -->
        <section v-show="activeSection === 'localization'" class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">{{ $t('pages.configuration.localization.title') }}</h2>

          <!-- Currency chips -->
          <div class="mb-4">
            <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('pages.configuration.localization.currencies') }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="cur in currencies"
                :key="cur.code"
                @click="() => { cur.active = !cur.active; markChanged() }"
                :class="[
                  'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                  cur.active
                    ? 'border-brand-500 bg-brand-50 text-brand-600 dark:border-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400',
                ]"
              >
                {{ cur.code }}
                <span v-if="cur.default" class="ml-1 text-xs text-gray-400 dark:text-gray-500">{{ $t('pages.configuration.localization.default') }}</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <Select
              v-model="language"
              :options="languageOptions"
              :label="$t('pages.configuration.localization.language')"
              @update:modelValue="markChanged"
            />
            <Select
              v-model="timezone"
              :options="timezoneOptions"
              :label="$t('pages.configuration.localization.timezone')"
              @update:modelValue="markChanged"
            />
          </div>
        </section>

        <!-- API & Webhooks -->
        <section v-show="activeSection === 'api'" class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">{{ $t('pages.configuration.api.title') }}</h2>
          <div class="space-y-4">
            <Input
              v-model="apiEndpoint"
              :label="$t('pages.configuration.api.endpoint')"
              @update:modelValue="markChanged"
              type="text"
            />
            <div>
              <p class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('pages.configuration.api.apiKey') }}</p>
              <div class="flex gap-2">
                <Input
                  :type="showApiKey ? 'text' : 'password'"
                  v-model="apiKey"
                  @update:modelValue="markChanged"
                  class="flex-1"
                />
                <Button variant="outline" size="sm" @click="showApiKey = !showApiKey">
                  {{ showApiKey ? $t('pages.configuration.api.hide') : $t('pages.configuration.api.show') }}
                </Button>
              </div>
            </div>
            <Input
              v-model="webhookUrl"
              :label="$t('pages.configuration.api.webhookUrl')"
              @update:modelValue="markChanged"
              type="text"
            />

            <!-- Delivery mode toggles -->
            <div class="space-y-3 pt-2">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('pages.configuration.api.deliveryMode') }}</p>
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
            {{ $t('pages.configuration.saveBar.unsavedChanges', { count: changeCount }) }}
          </span>
          <Button variant="outline" size="sm" @click="discard">{{ $t('pages.configuration.saveBar.discard') }}</Button>
          <Button variant="primary" size="sm" @click="save">{{ $t('pages.configuration.saveBar.save') }}</Button>
        </div>
      </div>
    </Teleport>
  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  AppShell, PageBreadcrumb, ToggleSwitch, useAppStore,
  PaymentIcon, SettingsIcon, PlugInIcon, ListIcon,
  Tabs, Button, Input, Select,
} from '@hivespace/shared'

const { t } = useI18n()
const appStore = useAppStore()

const railSearch = ref('')
const activeSection = ref('payments')
const hasChanges = ref(false)
const changeCount = ref(0)

const railGroups = computed(() => [
  {
    title: t('pages.configuration.nav.workspace'),
    items: [
      { id: 'localization', label: t('pages.configuration.tabs.localization'), icon: SettingsIcon },
      { id: 'api',          label: t('pages.configuration.tabs.api'),          icon: PlugInIcon },
    ],
  },
  {
    title: t('pages.configuration.nav.commerce'),
    items: [
      { id: 'payments', label: t('pages.configuration.tabs.payments'), icon: PaymentIcon },
      { id: 'tax',      label: t('pages.configuration.tabs.tax'),      icon: ListIcon },
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

const markChanged = () => {
  hasChanges.value = true
  changeCount.value++
}

// Provider state separated from display data
const providerEnabled = ref<Record<string, boolean>>({
  vnpay: true,
  momo: true,
  stripe: false,
  zalopay: true,
})

const paymentProviders = computed(() => [
  { id: 'vnpay',   name: t('pages.configuration.payments.providers.vnpay'),   sub: t('pages.configuration.payments.providers.vnpayDesc'),   abbr: 'VP', color: '#1e40af' },
  { id: 'momo',    name: t('pages.configuration.payments.providers.momo'),    sub: t('pages.configuration.payments.providers.momoDesc'),    abbr: 'MM', color: '#9333ea' },
  { id: 'stripe',  name: t('pages.configuration.payments.providers.stripe'),  sub: t('pages.configuration.payments.providers.stripeDesc'),  abbr: 'ST', color: '#4f46e5' },
  { id: 'zalopay', name: t('pages.configuration.payments.providers.zalopay'), sub: t('pages.configuration.payments.providers.zalopayDesc'), abbr: 'ZP', color: '#0369a1' },
])

const feeTable = ref([
  { tier: 1, fee: '2.5%', threshold: '₫500M+' },
  { tier: 2, fee: '3.0%', threshold: '₫100M – 499M' },
  { tier: 3, fee: '3.5%', threshold: '₫20M – 99M' },
  { tier: 4, fee: '4.0%', threshold: '< ₫20M' },
])

const payoutSchedule = ref('Weekly')

const payoutTabOptions = computed(() => [
  { label: t('pages.configuration.payments.payout.daily'),   value: 'Daily' },
  { label: t('pages.configuration.payments.payout.weekly'),  value: 'Weekly' },
  { label: t('pages.configuration.payments.payout.monthly'), value: 'Monthly' },
])

// Payment toggle state separated from display data
const paymentToggleValues = ref<Record<string, boolean>>({
  auto_refund:   true,
  split_payment: false,
  fraud_block:   true,
  escrow:        true,
})

const paymentToggles = computed(() => [
  { key: 'auto_refund',   label: t('pages.configuration.payments.toggles.autoRefund'),   sub: t('pages.configuration.payments.toggles.autoRefundDesc') },
  { key: 'split_payment', label: t('pages.configuration.payments.toggles.splitPayment'), sub: t('pages.configuration.payments.toggles.splitPaymentDesc') },
  { key: 'fraud_block',   label: t('pages.configuration.payments.toggles.fraudBlock'),   sub: t('pages.configuration.payments.toggles.fraudBlockDesc') },
  { key: 'escrow',        label: t('pages.configuration.payments.toggles.escrowHold'),   sub: t('pages.configuration.payments.toggles.escrowHoldDesc') },
])

const taxId = ref('0312345678')
const vatRate = ref('10')

const currencies = ref([
  { code: 'VND', active: true, default: true },
  { code: 'USD', active: true, default: false },
  { code: 'EUR', active: false, default: false },
  { code: 'SGD', active: false, default: false },
])

const language = ref('vi')
const timezone = ref('Asia/Ho_Chi_Minh')

const languageOptions = computed(() => [
  { value: 'vi', label: t('pages.configuration.localization.languages.vi') },
  { value: 'en', label: t('pages.configuration.localization.languages.en') },
])

const timezoneOptions = computed(() => [
  { value: 'Asia/Ho_Chi_Minh', label: t('pages.configuration.localization.timezones.hcm') },
  { value: 'UTC',              label: t('pages.configuration.localization.timezones.utc') },
  { value: 'Asia/Singapore',   label: t('pages.configuration.localization.timezones.sg') },
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
  { key: 'retry', label: t('pages.configuration.api.toggles.autoRetry'),     sub: t('pages.configuration.api.toggles.autoRetryDesc') },
  { key: 'async', label: t('pages.configuration.api.toggles.asyncDelivery'), sub: t('pages.configuration.api.toggles.asyncDeliveryDesc') },
])

const discard = () => {
  hasChanges.value = false
  changeCount.value = 0
}

const save = () => {
  hasChanges.value = false
  changeCount.value = 0
  appStore.notifySuccess('Configuration saved', 'v2.185')
}
</script>

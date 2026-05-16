<template>
  <Transition name="popover-fade">
    <div v-if="modelValue" ref="popoverRef" :class="containerClass">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {{ t('storefront.cart.shopCouponTitle', { name: resolvedShopName }) }}
        </h3>
        <button @click="close"
          class="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors">
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="px-4 pt-4 pb-3 shrink-0">
        <div class="flex gap-2">
          <div class="flex-grow relative">
            <Ticket class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-60" />
            <input v-model="inputCode" type="text" :placeholder="t('storefront.cart.enterPromoCode')"
              class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-gray-400 transition-all"
              @keyup.enter="applyManualCode" />
          </div>
          <button @click="applyManualCode" :class="[
            'px-5 py-2 text-sm font-medium rounded-sm transition-all whitespace-nowrap',
            inputCode.trim()
              ? 'bg-primary hover:bg-primary-dark text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed',
          ]">
            {{ t('storefront.cart.apply') }}
          </button>
        </div>
      </div>

      <div class="px-4 pb-4">
        <div v-if="isLoading" class="flex justify-center py-8">
          <Spinner />
        </div>

        <div v-else-if="resolvedCoupons.length > 0" class="pr-1 scrollbar-thin"
          :class="shouldScrollCoupons ? 'overflow-y-auto' : 'overflow-visible'" :style="listStyle">
          <div class="flex flex-col gap-3">
            <Radio v-for="option in couponOptions" :key="option.value" v-model="draftSelectedCouponCode"
              :value="option.value" name="available-coupon" :disabled="option.disabled"
              :class="getCouponOptionClass(option.coupon)">
              <div class="relative flex min-h-[104px] w-full flex-1 items-stretch overflow-hidden">
                <div class="flex w-[100px] shrink-0 flex-col items-center justify-center border-r border-dashed p-3"
                  :class="getCouponBrandClass(option.coupon)">
                  <div
                    class="mb-1 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm dark:bg-gray-700">
                    <img
                      v-if="resolvedStoreLogoUrl"
                      :src="resolvedStoreLogoUrl"
                      :alt="resolvedShopName"
                      class="h-full w-full object-cover"
                    />
                    <Store v-else class="w-5 h-5 text-gray-400" />
                  </div>
                  <span
                    class="mt-1 w-full truncate px-1 text-center text-[10px] leading-tight text-gray-500 dark:text-gray-400">
                    {{ resolvedShopName }}
                  </span>
                </div>

                <div class="flex grow items-center bg-white p-3 dark:bg-gray-900">
                  <div class="min-w-0 flex-1 pr-3" :class="getCouponContentClass(option.coupon)">
                    <div class="mb-0.5 text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {{ getCouponDiscountLabel(option.coupon) }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ option.coupon.name || t('storefront.cart.limitedQuantity') }}
                    </div>
                    <div class="mt-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                      {{ t('storefront.cart.minOrder', { amount: formatPrice(option.coupon.minOrderAmount) }) }}
                    </div>
                    <div v-if="option.coupon.endDateTime" class="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                      {{ t('storefront.cart.expires', { date: formatDate(option.coupon.endDateTime) }) }}
                    </div>
                  </div>

                  <div v-if="isCouponUnavailable(option.coupon)" class="absolute right-2 bottom-2 shrink-0 opacity-60">
                    <div class="rotate-[-15deg] rounded border-2 border-gray-400 px-2 py-0.5 dark:border-gray-500">
                      <span
                        class="whitespace-pre-line text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-400">
                        {{ t('storefront.cart.notEligible') }}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </Radio>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-8 text-center">
          <div
            class="mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gray-50 dark:bg-gray-800">
            <img :src="emptyStateImage" alt="No coupons" class="h-20 w-20 object-contain opacity-80" />
          </div>
          <p class="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
            {{ t('storefront.cart.noCoupons') }}
          </p>
          <p class="max-w-[260px] text-xs text-gray-400 dark:text-gray-500">
            {{ t('storefront.cart.noCouponsHint') }}
          </p>
        </div>

        <div class="mt-4 flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
          <Button variant="outline" size="md" className="min-w-[140px] rounded-sm uppercase" :onClick="close">
            {{ t('storefront.cart.back') }}
          </Button>
          <Button variant="primary" size="md" className="min-w-[140px] rounded-sm uppercase"
            :onClick="commitCouponSelection">
            {{ t('storefront.cart.apply') }}
          </Button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Button, Radio, Spinner, useFormatDate } from '@hivespace/shared'
import { storeToRefs } from 'pinia'
import { X, Ticket, Store } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { DiscountType } from '@hivespace/shared'
import { useCouponStore } from '@/stores'
import emptyStateImage from '@/assets/images/coupon-empty.webp'
import type { AvailableCoupon } from '@/types'

const COUPON_CARD_HEIGHT = 104
const COUPON_CARD_GAP = 12
const COUPON_CARD_BORDER_HEIGHT = 2
const MAX_VISIBLE_COUPONS = 3

interface Props {
  modelValue: boolean
  storeId?: string
  productIds?: number[]
  coupons?: AvailableCoupon[]
  selectedCouponCode?: string
  shouldFetchCoupons?: boolean
  align?: 'bottom-left' | 'bottom-right'
}

const props = withDefaults(defineProps<Props>(), {
  productIds: () => [],
  coupons: () => [],
  selectedCouponCode: '',
  shouldFetchCoupons: true,
  align: 'bottom-left',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'apply-coupon': [code: string | null]
}>()

const { t } = useI18n()
const { formatDate } = useFormatDate()
const couponStore = useCouponStore()
const { availableCouponStoresByKey, loadingByKey } = storeToRefs(couponStore)
const inputCode = ref('')
const popoverRef = ref<HTMLElement | null>(null)
const hasCenteredAfterLoad = ref(false)
const draftSelectedCouponCode = ref<string | null>(null)

const normalizedProductIds = computed(
  () => [...new Set(props.productIds.filter(productId => Number.isFinite(productId)))],
)

const couponRequestKey = computed(() =>
  props.storeId ? couponStore.buildCouponRequestKey(props.storeId, normalizedProductIds.value) : '',
)

const containerClass = computed(() => {
  const alignClass = props.align === 'bottom-right' ? 'right-0' : 'left-0'

  return [
    'absolute top-full z-[100] mt-2 flex w-[515px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:border-gray-800 dark:bg-gray-900',
    alignClass,
  ]
})

const resolvedCouponStore = computed(() => {
  if (!props.storeId) {
    return null
  }

  return availableCouponStoresByKey.value[couponRequestKey.value] ?? null
})

const resolvedShopName = computed(() => resolvedCouponStore.value?.storeName || 'Platform')
const resolvedStoreLogoUrl = computed(() => resolvedCouponStore.value?.storeLogoUrl || null)

const resolvedCoupons = computed<AvailableCoupon[]>(() => {
  if (props.coupons.length > 0) {
    return props.coupons
  }

  if (!props.shouldFetchCoupons) {
    return []
  }

  if (!props.storeId) {
    return []
  }

  return resolvedCouponStore.value?.coupons ?? []
})

const isLoading = computed(() => {
  if (!props.storeId) {
    return false
  }

  return !!loadingByKey.value[couponRequestKey.value]
})

const shouldScrollCoupons = computed(
  () => resolvedCoupons.value.length > MAX_VISIBLE_COUPONS,
)

const listStyle = computed(() => {
  if (!shouldScrollCoupons.value) {
    return undefined
  }

  const maxHeight =
    MAX_VISIBLE_COUPONS * (COUPON_CARD_HEIGHT + COUPON_CARD_BORDER_HEIGHT) +
    Math.max(MAX_VISIBLE_COUPONS - 1, 0) * COUPON_CARD_GAP

  return {
    maxHeight: `${maxHeight}px`,
  }
})

const couponOptions = computed(() =>
  resolvedCoupons.value.map((coupon) => ({
    label: coupon.code,
    value: coupon.code,
    disabled: isCouponUnavailable(coupon),
    coupon,
  })),
)

const isCouponUnavailable = (coupon: AvailableCoupon) =>
  coupon.isExpired || coupon.isApplicable === false

const isDraftCouponSelected = (coupon: AvailableCoupon) =>
  !isCouponUnavailable(coupon) && draftSelectedCouponCode.value === coupon.code

const resetDraftState = () => {
  const selectedCode = props.selectedCouponCode || null
  const selectedCoupon = resolvedCoupons.value.find((coupon) => coupon.code === selectedCode)
  draftSelectedCouponCode.value =
    selectedCoupon && !isCouponUnavailable(selectedCoupon) ? selectedCode : null
  inputCode.value = ''
}

const getCouponOptionClass = (coupon: AvailableCoupon) => [
  'w-full flex-row-reverse items-stretch justify-between overflow-hidden rounded-sm border pr-5 transition-colors [&>div:first-child]:ml-4 [&>div:first-child]:mr-0 [&>div:first-child]:self-center',
  isCouponUnavailable(coupon)
    ? 'cursor-not-allowed border-gray-200 opacity-70 dark:border-gray-700'
    : isDraftCouponSelected(coupon)
      ? 'border-primary'
      : 'border-gray-200 hover:border-primary/40 dark:border-gray-700',
]

const getCouponBrandClass = (coupon: AvailableCoupon) =>
  isDraftCouponSelected(coupon)
    ? 'border-primary/40'
    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'

const getCouponContentClass = (coupon: AvailableCoupon) =>
  isCouponUnavailable(coupon) ? 'blur-[0.5px]' : ''

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

const getCouponDiscountLabel = (coupon: AvailableCoupon) => {
  if (
    coupon.discountType === DiscountType.FixedAmount &&
    coupon.discountAmount != null
  ) {
    return t('storefront.cart.discountFixedLabel', {
      amount: formatPrice(coupon.discountAmount),
    })
  }

  return t('storefront.cart.discountLabel', {
    percent: coupon.discountPercentage,
  })
}

const centerPopoverInViewport = async (behavior: ScrollBehavior) => {
  await nextTick()

  requestAnimationFrame(() => {
    const popover = popoverRef.value

    if (!popover) {
      return
    }

    const rect = popover.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const currentScrollY = window.scrollY
    const targetTop = currentScrollY + rect.top - (viewportHeight - rect.height) / 2
    const alreadyCentered = Math.abs(rect.top - (viewportHeight - rect.height) / 2) < 24
    const fullyVisible = rect.top >= 16 && rect.bottom <= viewportHeight - 16

    if (alreadyCentered || fullyVisible) {
      return
    }

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior,
    })
  })
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!isOpen) {
      hasCenteredAfterLoad.value = false
      resetDraftState()
      return
    }

    resetDraftState()
    await centerPopoverInViewport('smooth')

    if (!props.storeId || !props.shouldFetchCoupons) {
      return
    }

    couponStore.fetchAvailableCoupons(props.storeId, normalizedProductIds.value).catch((error) => {
      console.error('Failed to load available coupons', error)
    })
  },
  { immediate: true },
)

watch(
  [() => props.storeId, normalizedProductIds],
  ([storeId, productIds], [previousStoreId, previousProductIds]) => {
    if (
      !props.modelValue ||
      !props.shouldFetchCoupons ||
      !storeId ||
      (storeId === previousStoreId && productIds.join(',') === previousProductIds.join(','))
    ) {
      return
    }

    couponStore.fetchAvailableCoupons(storeId, productIds, true).catch((error) => {
      console.error('Failed to reload available coupons', error)
    })
  },
)

watch(
  () => isLoading.value,
  async (loading) => {
    if (!props.modelValue || loading || hasCenteredAfterLoad.value) {
      return
    }

    hasCenteredAfterLoad.value = true
    await centerPopoverInViewport('smooth')
  },
)

const close = () => {
  resetDraftState()
  emit('update:modelValue', false)
}

const applyManualCode = () => {
  const code = inputCode.value.trim()
  inputCode.value = code

  if (!code) {
    return
  }

  draftSelectedCouponCode.value = null
}

watch(draftSelectedCouponCode, (code) => {
  if (code) {
    inputCode.value = ''
  }
})

const commitCouponSelection = () => {
  const manualCode = inputCode.value.trim()
  const code = manualCode || draftSelectedCouponCode.value || null

  emit('apply-coupon', code)
  close()
}
</script>

<style scoped>
.popover-fade-enter-active,
.popover-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.popover-fade-enter-to,
.popover-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}

.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>

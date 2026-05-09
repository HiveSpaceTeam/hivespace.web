import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { checkoutService } from '@/services/checkout.service'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { CheckoutPreview, CheckoutRequest, CheckoutResult } from '@/types'

export const useCheckoutStore = defineStore('checkout', () => {
  const preview = ref<CheckoutPreview | null>(null)
  const { isLoading: loading, run } = useAsyncAction()
  const { isLoading: submitting, run: runSubmit } = useAsyncAction()

  const storeCouponMap = ref<Record<string, string>>({})
  const platformCouponCode = ref('')

  const fetchPreview = async () => {
    const storeCoupons = Object.entries(storeCouponMap.value)
      .filter(([, code]) => !!code)
      .map(([storeId, couponCode]) => ({ storeId, couponCode }))

    preview.value = await run(() =>
      checkoutService.getPreview({
        storeCoupons: storeCoupons.length ? storeCoupons : undefined,
        platformCouponCodes: platformCouponCode.value ? [platformCouponCode.value] : undefined,
      }),
    )
  }

  const applyStoreCoupon = (storeId: string, code: string) => {
    storeCouponMap.value = { ...storeCouponMap.value, [storeId]: code }
    fetchPreview()
  }

  const applyPlatformCoupon = (code: string) => {
    platformCouponCode.value = code
    fetchPreview()
  }

  const submitCheckout = async (request: Omit<CheckoutRequest, 'couponCodes'>): Promise<CheckoutResult> => {
    const couponCodes = platformCouponCode.value ? [platformCouponCode.value] : undefined
    return runSubmit(() => checkoutService.initiateCheckout({ ...request, couponCodes }))
  }

  const packages = computed(() => preview.value?.packages ?? [])
  const totalItems = computed(() => preview.value?.totalItems ?? 0)
  const subtotal = computed(() => preview.value?.subtotal ?? 0)
  const originalSubtotal = computed(() => preview.value?.originalSubtotal ?? 0)
  const totalShippingFee = computed(() => preview.value?.totalShippingFee ?? 0)
  const grandTotal = computed(() => preview.value?.grandTotal ?? 0)
  const shippingDiscount = computed(() =>
    packages.value.reduce(
      (sum, pkg) => sum + ((pkg.originalShippingFee ?? pkg.shippingFee) - pkg.shippingFee),
      0,
    ),
  )
  const totalSaved = computed(() => originalSubtotal.value - subtotal.value + shippingDiscount.value)

  return {
    preview,
    loading,
    submitting,
    storeCouponMap,
    platformCouponCode,
    fetchPreview,
    applyStoreCoupon,
    applyPlatformCoupon,
    submitCheckout,
    packages,
    totalItems,
    subtotal,
    originalSubtotal,
    totalShippingFee,
    grandTotal,
    shippingDiscount,
    totalSaved,
  }
})

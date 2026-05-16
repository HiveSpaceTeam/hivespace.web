import { defineStore } from 'pinia'
import { ref } from 'vue'
import { couponService } from '@/services/coupon.service'
import type { AvailableCouponStore } from '@/types'

const normalizeProductIds = (productIds: number[]) =>
  [...new Set(productIds.filter(productId => Number.isFinite(productId)))]

const buildCouponRequestKey = (storeId: string, productIds: number[]) =>
  `${storeId}:${normalizeProductIds(productIds).join(',')}`

export const useCouponStore = defineStore('coupon', () => {
  const availableCouponStoresByKey = ref<Record<string, AvailableCouponStore>>({})
  const loadingByKey = ref<Record<string, boolean>>({})
  const loadedByKey = ref<Record<string, boolean>>({})

  const fetchAvailableCoupons = async (storeId: string, productIds: number[], force = false) => {
    if (!storeId) return
    const requestKey = buildCouponRequestKey(storeId, productIds)
    if (!force && loadedByKey.value[requestKey]) return

    loadingByKey.value = { ...loadingByKey.value, [requestKey]: true }

    try {
      availableCouponStoresByKey.value = {
        ...availableCouponStoresByKey.value,
        [requestKey]: await couponService.getAvailableCoupons(storeId, productIds),
      }
      loadedByKey.value = { ...loadedByKey.value, [requestKey]: true }
    } finally {
      loadingByKey.value = { ...loadingByKey.value, [requestKey]: false }
    }
  }

  return {
    availableCouponStoresByKey,
    buildCouponRequestKey,
    loadingByKey,
    loadedByKey,
    fetchAvailableCoupons,
  }
})

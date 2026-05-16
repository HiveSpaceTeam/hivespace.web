<template>
  <div class="min-h-screen flex flex-col bg-[#f5f5f5] dark:bg-surface-dark">
    <CartHeader />

    <main class="flex-grow py-6">
      <div class="container mx-auto px-4">
        <div
          class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-sm p-3 mb-4 flex items-center gap-2 text-base text-green-700 dark:text-green-400">
          <Truck class="w-5 h-5 shrink-0" />
          <span v-html="t('storefront.cart.freeShippingBanner')"></span>
        </div>

        <div v-if="isLoading" class="flex justify-center py-16">
          <Spinner />
        </div>

        <div v-else class="flex flex-col lg:flex-row gap-4">
          <div class="flex-grow">
            <div class="bg-white dark:bg-card-dark rounded-sm shadow-sm mb-3 p-4">
              <div class="flex items-center gap-4 text-base text-gray-600 dark:text-gray-300">
                <Checkbox :model-value="selectAll" @change="handleSelectAllChange">
                  {{ t('storefront.cart.selectAll', { count: totalItems }) }}
                </Checkbox>
                <div class="hidden md:flex items-center ml-auto gap-0 text-gray-500 dark:text-gray-400 text-sm">
                  <span class="w-28 text-center">{{ t('storefront.cart.unitPrice') }}</span>
                  <span class="w-32 text-center">{{ t('storefront.cart.quantity') }}</span>
                  <span class="w-28 text-center">{{ t('storefront.cart.subTotal') }}</span>
                  <span class="w-16 text-center">
                    <button @click="removeSelected" class="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div
              v-for="(group, groupIndex) in cartGroups"
              :key="group.storeId"
              class="bg-white dark:bg-card-dark rounded-sm shadow-sm mb-3 transition-all relative"
              :class="{ 'z-40': shopCouponOpenMap[group.storeId], 'z-10': !shopCouponOpenMap[group.storeId] }">
              <div class="flex items-center gap-2 p-4 border-b border-gray-100 dark:border-gray-700">
                <Checkbox :model-value="group.selected" @change="(checked: boolean) => handleGroupSelectChange(groupIndex, checked)" />
                <Store class="w-4 h-4 text-primary" />
                <span class="font-medium text-base text-gray-800 dark:text-gray-200">{{ group.storeName }}</span>
                <span v-if="group.isMall" class="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">
                  {{ t('storefront.cart.mall') }}
                </span>
              </div>

              <div
                v-for="(item, itemIndex) in group.items"
                :key="item.id"
                class="flex items-start gap-3 p-4 border-b border-gray-50 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <Checkbox
                  :model-value="item.selected"
                  @change="(checked: boolean) => handleItemSelectChange(groupIndex, item, checked)"
                  class="mt-4 shrink-0" />

                <div class="w-20 h-20 shrink-0 rounded-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                  <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                </div>

                <div class="flex-grow min-w-0">
                  <h3 class="text-base text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug">{{ item.name }}</h3>
                  <div v-if="item.variant" class="mt-1">
                    <span class="text-sm text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {{ item.variant }}
                    </span>
                  </div>
                </div>

                <div class="hidden md:flex items-center gap-0 shrink-0">
                  <div class="w-28 text-center">
                    <div v-if="item.originalPrice && item.originalPrice > item.price" class="text-sm text-gray-400 line-through">
                      {{ formatPrice(item.originalPrice) }}
                    </div>
                    <div class="text-base font-medium text-primary">
                      {{ formatPrice(item.price) }}
                    </div>
                  </div>

                  <div class="w-32 flex items-center justify-center">
                    <QuantityControl :model-value="item.quantity" @update:model-value="(val: number) => handleQuantityChange(item, val)" :min="1" size="md" />
                  </div>

                  <div class="w-28 text-center">
                    <span class="text-base font-medium text-primary">{{ formatPrice(item.price * item.quantity) }}</span>
                  </div>

                  <div class="w-16 text-center">
                    <button @click="removeItem(groupIndex, itemIndex)" class="text-gray-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div class="md:hidden flex flex-col items-end gap-2 shrink-0">
                  <span class="text-base font-medium text-primary">{{ formatPrice(item.price) }}</span>
                  <QuantityControl :model-value="item.quantity" @update:model-value="(val: number) => handleQuantityChange(item, val)" :min="1" size="sm" />
                </div>
              </div>

              <div class="relative border-t border-gray-100 dark:border-gray-800">
                <div class="flex items-center gap-2 px-4 py-3">
                  <Ticket class="w-4 h-4 text-primary" />
                  <button
                    @click="toggleShopCouponDropdown(group)"
                    class="flex items-center gap-1 text-base text-primary hover:text-primary-dark transition-colors">
                    <span>{{ t('storefront.cart.addShopCoupon') }}</span>
                    <ChevronRight class="w-4 h-4 transition-transform" :class="{ 'rotate-90': shopCouponOpenMap[group.storeId] }" />
                  </button>
                  <span
                    v-if="group.appliedStoreCoupon?.couponCode"
                    class="ml-auto text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                    {{ t('storefront.cart.couponApplied', { code: group.appliedStoreCoupon.couponCode }) }}
                  </span>
                </div>
                <AvailableCouponPopover
                  :model-value="!!shopCouponOpenMap[group.storeId]"
                  @update:model-value="(val: boolean) => (shopCouponOpenMap[group.storeId] = val)"
                  :store-id="group.storeId"
                  :product-ids="getSelectedProductIds(group)"
                  :coupons="[]"
                  :should-fetch-coupons="group.items.some(item => item.selected)"
                  :selected-coupon-code="group.appliedStoreCoupon?.couponCode"
                  align="bottom-left"
                  @apply-coupon="(code: string | null) => handleApplyShopCoupon(group.storeId, code, group.appliedStoreCoupon?.couponCode)" />
              </div>
            </div>

            <div v-if="hasMore" class="flex justify-center mt-4">
              <Button @click="loadMore" variant="outline" size="md" class="rounded-sm">
                {{ t('storefront.cart.loadMore') }}
              </Button>
            </div>
          </div>

          <div class="lg:w-[320px] shrink-0">
            <div class="bg-white dark:bg-card-dark rounded-sm shadow-sm p-4 sticky top-20">
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-base text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Ticket class="w-4 h-4 text-primary" />
                    {{ t('storefront.cart.couponTitle') }}
                  </span>
                </div>
                <div class="flex gap-2">
                  <input
                    v-model="couponCodeInput"
                    type="text"
                    :placeholder="t('storefront.cart.enterCoupon')"
                    class="flex-grow min-w-0 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-sm bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-gray-400"
                    @keyup.enter="applyPlatformCoupon" />
                  <button
                    @click="applyPlatformCoupon"
                    class="shrink-0 bg-primary hover:bg-primary-dark text-white px-4 py-2 text-base rounded-sm transition-colors whitespace-nowrap">
                    {{ t('storefront.cart.applyCoupon') }}
                  </button>
                </div>
                <div v-if="platformCoupons.length > 0" class="mt-3 flex flex-wrap gap-2">
                  <button
                    v-for="coupon in platformCoupons"
                    :key="coupon.couponCode"
                    @click="removePlatformCoupon(coupon.couponCode)"
                    class="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm text-green-700 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300">
                    <span>{{ coupon.couponCode }}</span>
                    <X class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div class="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
                <div class="flex items-center justify-between text-base">
                  <span class="text-gray-500 dark:text-gray-400">{{ t('storefront.cart.provisional') }}</span>
                  <span class="text-gray-800 dark:text-gray-200">{{ formatPrice(subtotal) }}</span>
                </div>
                <div class="flex items-center justify-between text-base">
                  <span class="text-gray-500 dark:text-gray-400">{{ t('storefront.cart.discountAmount') }}</span>
                  <span class="text-green-600">-{{ formatPrice(discount) }}</span>
                </div>
              </div>

              <div class="border-t border-gray-100 dark:border-gray-700 mt-4 pt-4">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-base text-gray-600 dark:text-gray-400">{{ t('storefront.cart.totalAmount') }}</span>
                  <div class="text-right">
                    <span class="text-2xl font-bold text-primary">{{ formatPrice(total) }}</span>
                    <div class="text-sm text-gray-400">{{ t('storefront.cart.vatIncluded') }}</div>
                  </div>
                </div>
                <Button @click="handleCheckout" variant="primary" size="md" class="w-full mt-4 rounded-sm">
                  {{ t('storefront.cart.checkout') }} ({{ selectedItemCount }})
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8">
          <div class="bg-white dark:bg-card-dark rounded-sm shadow-sm p-4">
            <h2 class="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">
              {{ t('storefront.cart.recommended') }}
            </h2>
            <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              <div
                v-for="product in recommendedProducts"
                :key="product.id"
                class="shrink-0 w-[160px] border border-gray-100 dark:border-gray-700 rounded-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                <div class="w-full h-[160px] overflow-hidden">
                  <img :src="product.imageURL" :alt="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div class="p-2">
                  <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-snug mb-1">{{ product.name }}</p>
                  <div class="flex items-center gap-1">
                    <span class="text-base font-medium text-primary">{{ formatPrice(product.price) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <StorefrontFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Truck, Trash2, Store, Ticket, ChevronRight, X } from 'lucide-vue-next'
import { QuantityControl, Button, Checkbox, Spinner, useAppStore } from '@hivespace/shared'
import CartHeader from '@/components/layout/CartHeader.vue'
import StorefrontFooter from '@/components/layout/StorefrontFooter.vue'
import AvailableCouponPopover from '@/components/common/AvailableCouponPopover.vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useCartStore, useProductStore } from '@/stores'
import type { CartGroup, CartItem, InvalidAppliedCoupon } from '@/types'

const { t } = useI18n()
const router = useRouter()
const appStore = useAppStore()

const cartStore = useCartStore()
const { cartGroups, hasMore, isLoading, platformCoupons, summary } = storeToRefs(cartStore)
const productStore = useProductStore()
const { recommendedProducts } = storeToRefs(productStore)

const couponCodeInput = ref('')
const shopCouponOpenMap = ref<Record<string, boolean>>({})

const totalItems = computed(() => cartGroups.value.reduce((sum, group) => sum + group.items.length, 0))
const selectedItemCount = computed(() =>
  cartGroups.value.reduce((sum, group) => sum + group.items.filter(item => item.selected).length, 0),
)
const selectAll = computed(() => cartGroups.value.length > 0 && cartGroups.value.every(group => group.selected))
const getSelectedProductIds = (group: CartGroup) =>
  [...new Set(group.items.filter(item => item.selected).map(item => item.productId))]
const subtotal = computed(() => summary.value.subTotal)
const discount = computed(() => summary.value.discountAmount)
const total = computed(() => summary.value.total)

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)

const notifyInvalidCoupons = (coupons: InvalidAppliedCoupon[] = []) => {
  coupons.forEach(coupon => {
    appStore.notifyError(
      t('storefront.cart.couponUnavailableTitle'),
      `${coupon.couponCode}: ${coupon.message}`,
    )
  })
}

const loadMore = async () => {
  const response = await cartStore.loadMoreCartSummary()
  notifyInvalidCoupons(response?.invalidatedCoupons ?? [])
}

const syncItemUpdate = async (item: CartItem) => {
  try {
    const response = await cartStore.syncItem(item)
    notifyInvalidCoupons(response?.invalidatedCoupons ?? [])
  } catch (err) {
    console.error('Failed to update cart item', err)
  }
}

const syncItemsUpdate = async (items: CartItem[], selectAllValue: boolean | null = null) => {
  try {
    const response = await cartStore.syncItems(items, selectAllValue)
    notifyInvalidCoupons(response?.invalidatedCoupons ?? [])
  } catch (err) {
    console.error('Failed to update cart items', err)
  }
}

const handleQuantityChange = (item: CartItem, value: number) => {
  if (item.quantity === value) return
  syncItemUpdate({ ...item, quantity: value })
}

const handleItemSelectChange = (groupIndex: number, item: CartItem, checked: boolean) => {
  const group = cartGroups.value[groupIndex]
  if (!group) return
  item.selected = checked
  group.selected = group.items.every(entry => entry.selected)
  syncItemUpdate({ ...item, selected: checked })
}

const handleGroupSelectChange = (groupIndex: number, checked: boolean) => {
  const group = cartGroups.value[groupIndex]
  if (!group) return
  group.selected = checked
  const updatedItems = group.items.map(item => ({ ...item, selected: checked }))
  group.items = updatedItems
  syncItemsUpdate(updatedItems)
}

const handleSelectAllChange = (checked: boolean) => {
  cartGroups.value.forEach(group => {
    group.selected = checked
    group.items = group.items.map(item => ({ ...item, selected: checked }))
  })
  syncItemsUpdate(cartGroups.value.flatMap(group => group.items), checked)
}

const removeItem = async (groupIndex: number, itemIndex: number) => {
  const group = cartGroups.value[groupIndex]
  const item = group?.items[itemIndex]
  if (!item) return

  try {
    const response = await cartStore.removeItem(item.cartItemId)
    notifyInvalidCoupons(response?.invalidatedCoupons ?? [])
  } catch (err) {
    console.error('Failed to remove cart item', err)
  }
}

const removeSelected = async () => {
  const selectedIds = cartGroups.value.flatMap(group =>
    group.items.filter(item => item.selected).map(item => item.cartItemId),
  )
  if (selectedIds.length === 0) return

  try {
    const response = await cartStore.removeItems(selectedIds)
    notifyInvalidCoupons(response?.invalidatedCoupons ?? [])
  } catch (err) {
    console.error('Failed to remove selected items', err)
  }
}

const toggleShopCouponDropdown = (group: CartGroup) => {
  shopCouponOpenMap.value = {
    ...shopCouponOpenMap.value,
    [group.storeId]: !shopCouponOpenMap.value[group.storeId],
  }
}

const handleApplyShopCoupon = async (
  storeId: string,
  code: string | null,
  appliedCouponCode?: string,
) => {
  if (!code && !appliedCouponCode) {
    return
  }

  const response = code
    ? await cartStore.applyStoreCoupon(storeId, code)
    : await cartStore.removeStoreCoupon(storeId)
  notifyInvalidCoupons(response?.invalidatedCoupons ?? [])
}

const applyPlatformCoupon = async () => {
  const couponCode = couponCodeInput.value.trim()
  if (!couponCode) return

  couponCodeInput.value = ''
  const response = await cartStore.applyPlatformCoupon(couponCode)
  notifyInvalidCoupons(response?.invalidatedCoupons ?? [])
}

const removePlatformCoupon = async (couponCode: string) => {
  const response = await cartStore.removePlatformCoupon(couponCode)
  notifyInvalidCoupons(response?.invalidatedCoupons ?? [])
}

const handleCheckout = () => {
  if (selectedItemCount.value === 0) {
    appStore.notifyInfo(t('storefront.cart.checkoutSelectionRequired'))
    return
  }

  router.push({ name: 'Checkout' })
}

const fetchRecommendedProducts = async () => {
  await productStore.fetchRecommendedProducts({
    page: 1,
    pageSize: 20,
  })
}

onMounted(async () => {
  const response = await cartStore.loadInitialCartSummary()
  notifyInvalidCoupons(response.invalidatedCoupons)
  void fetchRecommendedProducts()
})
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>

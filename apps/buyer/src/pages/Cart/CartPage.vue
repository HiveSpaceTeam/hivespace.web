<template>
  <div class="min-h-screen flex flex-col bg-[#f5f5f5] dark:bg-surface-dark">
    <!-- Cart Header -->
    <CartHeader />

    <!-- Main Cart Content -->
    <main class="flex-grow py-6">
      <div class="container mx-auto px-4">
        <!-- Free shipping banner -->
        <div
          class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-sm p-3 mb-4 flex items-center gap-2 text-base text-green-700 dark:text-green-400">
          <Truck class="w-5 h-5 shrink-0" />
          <span v-html="t('storefront.cart.freeShippingBanner')"></span>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center py-16">
          <Spinner />
        </div>

        <div v-else class="flex flex-col lg:flex-row gap-4">
          <!-- LEFT: Cart Items -->
          <div class="flex-grow">
            <!-- Select all header -->
            <div class="bg-white dark:bg-card-dark rounded-sm shadow-sm mb-3 p-4">
              <div class="flex items-center gap-4 text-base text-gray-600 dark:text-gray-300">
                <Checkbox v-model="selectAll" @change="handleSelectAllChange">
                  {{ t("storefront.cart.selectAll", { count: totalItems }) }}
                </Checkbox>
                <div class="hidden md:flex items-center ml-auto gap-0 text-gray-500 dark:text-gray-400 text-sm">
                  <span class="w-28 text-center">{{
                    t("storefront.cart.unitPrice")
                  }}</span>
                  <span class="w-32 text-center">{{
                    t("storefront.cart.quantity")
                  }}</span>
                  <span class="w-28 text-center">{{
                    t("storefront.cart.subTotal")
                  }}</span>
                  <span class="w-16 text-center">
                    <button @click="removeSelected" class="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <!-- Cart items grouped by seller -->
            <div v-for="(group, groupIndex) in cartGroups" :key="groupIndex"
              class="bg-white dark:bg-card-dark rounded-sm shadow-sm mb-3 transition-all relative" :class="{
                'z-40': shopCouponOpenMap[groupIndex],
                'z-10': !shopCouponOpenMap[groupIndex],
              }">
              <!-- Seller header -->
              <div class="flex items-center gap-2 p-4 border-b border-gray-100 dark:border-gray-700">
                <Checkbox v-model="group.selected" @change="handleGroupSelectChange(groupIndex)" />
                <Store class="w-4 h-4 text-primary" />
                <span class="font-medium text-base text-gray-800 dark:text-gray-200">{{ group.sellerName }}</span>
                <span v-if="group.isMall" class="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">{{
                  t("storefront.cart.mall") }}</span>
              </div>

              <!-- Items -->
              <div v-for="(item, itemIndex) in group.items" :key="item.id"
                class="flex items-start gap-3 p-4 border-b border-gray-50 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <Checkbox v-model="item.selected" @change="handleItemSelectChange(groupIndex, item)"
                  class="mt-4 shrink-0" />

                <!-- Product imageURL -->
                <div class="w-20 h-20 shrink-0 rounded-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                  <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                </div>

                <!-- Product details -->
                <div class="flex-grow min-w-0">
                  <h3 class="text-base text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug">
                    {{ item.name }}
                  </h3>
                  <div v-if="item.variant" class="mt-1">
                    <span
                      class="text-sm text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded">{{
                        item.variant }}</span>
                  </div>
                  <div class="flex items-center gap-1 mt-1">
                    <span v-if="item.isFreeShipping"
                      class="text-xs text-primary border border-primary px-1 py-0.5 rounded-sm">{{
                        t("storefront.cart.freeship") }}</span>
                    <span v-if="item.isReturn"
                      class="text-xs text-green-600 border border-green-500 px-1 py-0.5 rounded-sm">{{
                        t("storefront.cart.freeReturn") }}</span>
                  </div>
                </div>

                <!-- Price, quantity, subtotal (desktop) -->
                <div class="hidden md:flex items-center gap-0 shrink-0">
                  <!-- Price -->
                  <div class="w-28 text-center">
                    <div v-if="item.originalPrice" class="text-sm text-gray-400 line-through">
                      {{ formatPrice(item.originalPrice) }}
                    </div>
                    <div class="text-base font-medium text-gray-800 dark:text-gray-200">
                      {{ formatPrice(item.price) }}
                    </div>
                  </div>

                  <!-- Quantity control -->
                  <div class="w-32 flex items-center justify-center">
                    <QuantityControl :model-value="item.quantity" @update:model-value="
                      (val: number) => handleQuantityChange(item, val)
                    " :min="1" size="md" />
                  </div>

                  <!-- Subtotal -->
                  <div class="w-28 text-center">
                    <span class="text-base font-medium text-primary">{{
                      formatPrice(item.price * item.quantity)
                    }}</span>
                  </div>

                  <!-- Remove -->
                  <div class="w-16 text-center">
                    <button @click="removeItem(groupIndex, itemIndex)"
                      class="text-gray-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- Mobile: Price + Quantity -->
                <div class="md:hidden flex flex-col items-end gap-2 shrink-0">
                  <span class="text-base font-medium text-primary">{{
                    formatPrice(item.price)
                  }}</span>
                  <QuantityControl :model-value="item.quantity" @update:model-value="
                    (val: number) => handleQuantityChange(item, val)
                  " :min="1" size="sm" />
                </div>
              </div>

              <!-- Shop Coupon Section -->
              <div class="relative border-t border-gray-100 dark:border-gray-800">
                <!-- Shop Coupon Link -->
                <div class="flex items-center gap-2 px-4 py-3">
                  <Ticket class="w-4 h-4 text-primary" />
                  <button @click="toggleShopCouponDropdown(groupIndex)"
                    class="flex items-center gap-1 text-base text-primary hover:text-primary-dark transition-colors">
                    <span>{{ t("storefront.cart.addShopCoupon") }}</span>
                    <ChevronRight class="w-4 h-4 transition-transform"
                      :class="{ 'rotate-90': shopCouponOpenMap[groupIndex] }" />
                  </button>
                  <span v-if="appliedShopCoupons[groupIndex]"
                    class="ml-auto text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                    {{
                      t("storefront.cart.couponApplied", {
                        code: appliedShopCoupons[groupIndex],
                      })
                    }}
                  </span>
                </div>

                <!-- Inline Coupon Dropdown (Popover) -->
                <ShopCouponModal :model-value="!!shopCouponOpenMap[groupIndex]" @update:model-value="
                  (val: boolean) => (shopCouponOpenMap[groupIndex] = val)
                " :shop-name="group.sellerName" :coupons="getShopCoupons(group.sellerName)" @apply-coupon="
                  (code: string) => handleApplyShopCoupon(groupIndex, code)
                " />
              </div>
            </div>
          </div>
          <div class="lg:w-[320px] shrink-0">
            <div class="bg-white dark:bg-card-dark rounded-sm shadow-sm p-4 sticky top-20">
              <!-- Voucher section -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-base text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Ticket class="w-4 h-4 text-primary" />
                    {{ t("storefront.cart.couponTitle") }}
                  </span>
                </div>
                <div class="flex gap-2">
                  <input type="text" v-model="couponCode" :placeholder="t('storefront.cart.enterCoupon')"
                    class="flex-grow min-w-0 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-sm bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-gray-400" />
                  <button
                    class="shrink-0 bg-primary hover:bg-primary-dark text-white px-4 py-2 text-base rounded-sm transition-colors whitespace-nowrap">
                    {{ t("storefront.cart.applyCoupon") }}
                  </button>
                </div>
              </div>

              <div class="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
                <div class="flex items-center justify-between text-base">
                  <span class="text-gray-500 dark:text-gray-400">{{
                    t("storefront.cart.provisional")
                  }}</span>
                  <span class="text-gray-800 dark:text-gray-200">{{
                    formatPrice(subtotal)
                  }}</span>
                </div>
                <div class="flex items-center justify-between text-base">
                  <span class="text-gray-500 dark:text-gray-400">{{
                    t("storefront.cart.discountAmount")
                  }}</span>
                  <span class="text-green-600">-{{ formatPrice(discount) }}</span>
                </div>
              </div>

              <div class="border-t border-gray-100 dark:border-gray-700 mt-4 pt-4">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-base text-gray-600 dark:text-gray-400">{{
                    t("storefront.cart.totalAmount")
                  }}</span>
                  <div class="text-right">
                    <span class="text-2xl font-bold text-primary">{{
                      formatPrice(total)
                    }}</span>
                    <div class="text-sm text-gray-400">
                      {{ t("storefront.cart.vatIncluded") }}
                    </div>
                  </div>
                </div>
                <Button @click="$router.push({ name: 'Checkout' })" variant="primary" size="md"
                  class="w-full mt-4 rounded-sm">
                  {{ t("storefront.cart.checkout") }} ({{ selectedCount }})
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div class="mt-8">
          <div class="bg-white dark:bg-card-dark rounded-sm shadow-sm p-4">
            <h2 class="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">
              {{ t("storefront.cart.recommended") }}
            </h2>
            <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              <div v-for="product in recommendedProducts" :key="product.id"
                class="shrink-0 w-[160px] border border-gray-100 dark:border-gray-700 rounded-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                <div class="w-full h-[160px] overflow-hidden">
                  <img :src="product.imageURL" :alt="product.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div class="p-2">
                  <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-snug mb-1">
                    {{ product.name }}
                  </p>
                  <div class="flex items-center gap-1">
                    <span class="text-base font-medium text-primary">{{
                      formatPrice(product.price)
                    }}</span>
                    <!-- <span v-if="product.discount" class="text-xs text-white bg-primary px-1 rounded">-{{
                      product.discount }}%</span> -->
                  </div>
                  <!-- <div class="text-xs text-gray-400 mt-0.5">
                    {{ t("storefront.soldCount", { count: product.sold }) }}
                  </div> -->
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
import { ref, computed, onMounted, watch } from "vue";
import { Truck, Trash2, Store, Ticket, ChevronRight } from "lucide-vue-next";
import { QuantityControl, Button, Checkbox, Spinner } from "@hivespace/shared";
import CartHeader from "@/components/layout/CartHeader.vue";
import StorefrontFooter from "@/components/layout/StorefrontFooter.vue";
import ShopCouponModal from "@/components/common/ShopCouponModal.vue";
import type { ShopCoupon } from "@/components/common/ShopCouponModal.vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useCartStore } from "@/stores";
import { useCheckoutStore } from "@/stores";
import type { CartItem } from "@/types";
import { productService } from "@/services/product.service";
import type { PagedResponse, ProductSummary } from "@/types";

const { t } = useI18n();

const cartStore = useCartStore();
const { cartGroups, isLoading } = storeToRefs(cartStore);

const checkoutStore = useCheckoutStore();

// Page-local state
const couponCode = ref("");
const selectAll = ref(false);
const shopCouponOpenMap = ref<Record<number, boolean>>({});
const appliedShopCoupons = ref<Record<number, string>>({});

onMounted(async () => {
  await cartStore.loadCart();
  updateSelectAll();
  fetchRecommendedProducts();
  checkoutStore.fetchPreview();
});

watch(
  () => cartGroups.value,
  () => { checkoutStore.fetchPreview(); },
  { deep: true },
);

// Mock shop coupons per seller (including expired ones)
const shopCouponsMap: Record<string, ShopCoupon[]> = {
  "HiveSpace Official Store": [
    {
      code: "HIVE10",
      discountPercent: 10,
      minOrder: 200000,
      expiresAt: "31/03/2026",
    },
    {
      code: "HIVE20",
      discountPercent: 20,
      minOrder: 500000,
      expiresAt: "15/04/2026",
    },
    {
      code: "FREESHIP",
      discountPercent: 5,
      minOrder: 100000,
      expiresAt: "01/01/2026",
      isExpired: true,
    },
  ],
  "TechWorld Việt Nam": [
    {
      code: "TECH15",
      discountPercent: 15,
      minOrder: 300000,
      expiresAt: "20/03/2026",
    },
    {
      code: "TECH30",
      discountPercent: 30,
      minOrder: 1000000,
      expiresAt: "01/02/2026",
      isExpired: true,
    },
  ],
};

const getShopCoupons = (sellerName: string): ShopCoupon[] => {
  return shopCouponsMap[sellerName] || [];
};

const toggleShopCouponDropdown = (groupIndex: number) => {
  shopCouponOpenMap.value[groupIndex] = !shopCouponOpenMap.value[groupIndex];
};

const handleApplyShopCoupon = (groupIndex: number, code: string) => {
  appliedShopCoupons.value[groupIndex] = code;
};

// Computed
const totalItems = computed(() =>
  cartGroups.value.reduce((sum, g) => sum + g.items.length, 0),
);

const selectedCount = computed(() =>
  cartGroups.value.reduce(
    (sum, g) => sum + g.items.filter((i) => i.selected).length,
    0,
  ),
);

const subtotal = computed(() =>
  cartGroups.value.reduce(
    (sum, g) =>
      sum +
      g.items
        .filter((i) => i.selected)
        .reduce((s, i) => s + i.price * i.quantity, 0),
    0,
  ),
);

const discount = computed(() => Math.floor(subtotal.value * 0.05));
const total = computed(() => subtotal.value - discount.value);

// Methods
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const updateSelectAll = () => {
  selectAll.value =
    cartGroups.value.length > 0 && cartGroups.value.every((g) => g.selected);
};

const updateGroupSelect = (groupIndex: number) => {
  const group = cartGroups.value[groupIndex];
  if (!group || !group.items) return;
  group.selected = group.items.every((i) => i.selected);
  updateSelectAll();
};

const syncItemUpdate = async (item: CartItem) => {
  try {
    await cartStore.syncItem(item);
  } catch (err) {
    console.error("Failed to update cart item", err);
  }
};

const syncItemsUpdate = async (items: CartItem[]) => {
  if (items.length === 0) return;
  try {
    await cartStore.syncItems(items);
  } catch (err) {
    console.error("Failed to update cart items", err);
  }
};

const handleQuantityChange = (item: CartItem, val: number) => {
  item.quantity = val;
  syncItemUpdate(item);
};

const handleItemSelectChange = (groupIndex: number, item: CartItem) => {
  updateGroupSelect(groupIndex);
  syncItemUpdate(item);
};

const handleGroupSelectChange = (groupIndex: number) => {
  const group = cartGroups.value[groupIndex];
  if (!group) return;
  group.items.forEach((i) => (i.selected = group.selected));
  updateSelectAll();
  syncItemsUpdate(group.items);
};

const handleSelectAllChange = async () => {
  cartGroups.value.forEach((g) => {
    g.selected = selectAll.value;
    g.items.forEach((i) => (i.selected = selectAll.value));
  });
  const allItems = cartGroups.value.flatMap((g) => g.items);
  try {
    await cartStore.syncItems(allItems, selectAll.value);
  } catch (err) {
    console.error("Failed to update cart items", err);
  }
};

const removeItem = async (gIdx: number, iIdx: number) => {
  const group = cartGroups.value[gIdx];
  if (!group || !group.items) return;
  const item = group.items[iIdx];
  if (!item) return;
  try {
    await cartStore.removeItem(item.cartItemId);
    updateSelectAll();
  } catch (err) {
    console.error("Failed to remove cart item", err);
  }
};

const removeSelected = async () => {
  const selectedIds = cartGroups.value.flatMap((g) => g.items).filter((i) => i.selected).map((i) => i.cartItemId);
  if (selectedIds.length === 0) return;
  try {
    await cartStore.removeItems(selectedIds);
    updateSelectAll();
  } catch (err) {
    console.error("Failed to remove selected items", err);
  }
};

const recommendedProducts = ref<ProductSummary[]>([]);

const fetchRecommendedProducts = async () => {
  const result: PagedResponse<ProductSummary> =
    await productService.getProducts({
      page: 1,
      pageSize: 20,
    });
  recommendedProducts.value = result.items;
  // totalCount.value = result.pagination.totalItems
}


// Recommended products (mock)

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

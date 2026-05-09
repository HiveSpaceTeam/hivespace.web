<template>
  <Transition name="dropdown-fade">
    <div
      v-show="modelValue"
      ref="dropdownRef"
      class="absolute left-4 top-full mt-2 w-[515px] max-w-[calc(100vw-2rem)] h-[300px] max-h-[80vh] z-[100] bg-white dark:bg-gray-900 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0"
      >
        <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {{ t("storefront.cart.shopCouponTitle", { name: shopName }) }}
        </h3>
        <button
          @click="close"
          class="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Input Section -->
      <div class="px-4 pt-4 pb-3 shrink-0">
        <div class="flex gap-2">
          <div class="flex-grow relative">
            <Ticket
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-60"
            />
            <input
              v-model="inputCode"
              type="text"
              :placeholder="t('storefront.cart.enterPromoCode')"
              class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-gray-400 transition-all"
              @keyup.enter="applyManualCode"
            />
          </div>
          <button
            @click="applyManualCode"
            :class="[
              'px-5 py-2 text-sm font-medium rounded-sm transition-all whitespace-nowrap',
              inputCode.trim()
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed',
            ]"
          >
            {{ t("storefront.cart.apply") }}
          </button>
        </div>
      </div>

      <!-- Coupon List / Empty State -->
      <div class="px-4 pb-4 overflow-y-auto flex-grow scrollbar-thin">
        <!-- Coupon List -->
        <div v-if="coupons.length > 0" class="space-y-3">
          <div
            v-for="coupon in coupons"
            :key="coupon.code"
            class="relative flex items-stretch border rounded-sm overflow-hidden"
            :class="
              coupon.isExpired
                ? 'border-gray-200 dark:border-gray-700 opacity-70'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary/40'
            "
          >
            <!-- Left: Shop logo / coupon icon area -->
            <div
              class="w-[100px] shrink-0 flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 border-r border-dashed border-gray-200 dark:border-gray-700"
            >
              <div
                class="w-12 h-12 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm mb-1 overflow-hidden shrink-0"
              >
                <Store class="w-5 h-5 text-gray-400" />
              </div>
              <span
                class="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight mt-1 truncate w-full px-1"
                >{{ shopName }}</span
              >
            </div>

            <!-- Right: Coupon details -->
            <div
              class="flex-grow p-3 flex items-center justify-between gap-3 bg-white dark:bg-gray-900"
            >
              <div class="min-w-0">
                <div
                  class="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-0.5"
                >
                  {{
                    t("storefront.cart.discountLabel", {
                      percent: coupon.discountPercent,
                    })
                  }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ t("storefront.cart.limitedQuantity") }}
                </div>
                <div
                  v-if="coupon.expiresAt"
                  class="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5"
                >
                  {{ t("storefront.cart.expires", { date: coupon.expiresAt }) }}
                </div>
              </div>

              <!-- Not eligible stamp for expired coupons -->
              <div
                v-if="coupon.isExpired"
                class="shrink-0 absolute right-4 bottom-2 opacity-60"
              >
                <div
                  class="border-2 border-gray-400 dark:border-gray-500 rounded px-2 py-0.5 rotate-[-15deg]"
                >
                  <span
                    class="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest"
                  >
                    {{ t("storefront.cart.notEligible") }}
                  </span>
                </div>
              </div>

              <!-- Apply button for valid coupons -->
              <button
                v-else
                @click="applyCoupon(coupon)"
                class="shrink-0 z-10 px-4 py-1.5 text-sm font-medium bg-primary hover:bg-primary-dark text-white rounded-sm transition-colors whitespace-nowrap"
              >
                {{ t("storefront.cart.apply") }}
              </button>
            </div>

            <!-- Left circle cutout -->
            <div
              class="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-900 rounded-full border-r border-gray-200 dark:border-gray-700"
            ></div>
            <!-- Right circle cutout (only visual) -->
            <div
              v-if="false"
              class="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-900 rounded-full border-l border-gray-200 dark:border-gray-700"
            ></div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-8 text-center h-full"
        >
          <div
            class="w-28 h-28 mb-4 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden"
          >
            <img
              :src="emptyStateImage"
              alt="No coupons"
              class="w-20 h-20 object-contain opacity-80"
            />
          </div>
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {{ t("storefront.cart.noCoupons") }}
          </p>
          <p class="text-xs text-gray-400 dark:text-gray-500 max-w-[260px]">
            {{ t("storefront.cart.noCouponsHint") }}
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { X, Ticket, Store } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import emptyStateImage from "@/assets/images/coupon-empty.webp";

export interface ShopCoupon {
  code: string;
  discountPercent: number;
  minOrder: number;
  expiresAt?: string;
  isExpired?: boolean;
}

interface Props {
  modelValue: boolean;
  shopName: string;
  coupons?: ShopCoupon[];
}

withDefaults(defineProps<Props>(), {
  coupons: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "apply-coupon": [code: string];
}>();

const { t } = useI18n();
const inputCode = ref("");

const close = () => {
  emit("update:modelValue", false);
};

const applyManualCode = () => {
  const code = inputCode.value.trim();
  if (code) {
    emit("apply-coupon", code);
    inputCode.value = "";
    close();
  }
};

const applyCoupon = (coupon: ShopCoupon) => {
  emit("apply-coupon", coupon.code);
  close();
};
</script>

<style scoped>
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.dropdown-fade-enter-to,
.dropdown-fade-leave-from {
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

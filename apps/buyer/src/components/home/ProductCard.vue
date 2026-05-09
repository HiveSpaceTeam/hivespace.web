<template>
  <div
    class="group relative bg-white dark:bg-card-dark rounded-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 border border-transparent hover:border-primary overflow-hidden">
    <!-- Image -->
    <div class="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
      <img :src="product.imageURL" :alt="product.name" class="w-full h-full object-cover">

      <!-- Discount Badge -->
      <div v-if="product.discountPercentage"
        class="absolute top-0 right-0 bg-[#ffd839] text-[#ee4d2d] px-1 py-0.5 flex flex-col items-center justify-center opacity-90 rounded-bl-sm z-10">
        <span class="text-[10px] font-bold leading-none">{{ product.discountPercentage }}%</span>
        <span class="text-[10px] font-bold leading-none uppercase">Giảm</span>
      </div>

      <!-- Mall/Preferred Badge -->
      <div v-if="product.isMall"
        class="absolute top-1 left-[-2px] bg-[#d0011b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-r-sm z-10 shadow-sm before:content-[''] before:absolute before:bottom-[-2px] before:left-0 before:w-0 before:h-0 before:border-t-[2px] before:border-r-[2px] before:border-t-[#a00014] before:border-r-transparent">
        Mall
      </div>
      <div v-else-if="product.isPreferred"
        class="absolute top-1 left-[-2px] bg-[#ee4d2d] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-r-sm z-10 shadow-sm before:content-[''] before:absolute before:bottom-[-2px] before:left-0 before:w-0 before:h-0 before:border-t-[2px] before:border-r-[2px] before:border-t-[#b23921] before:border-r-transparent">
        Yêu thích
      </div>

      <!-- Overlay effect -->
      <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>

    <!-- Info -->
    <div class="p-2 flex flex-col h-[100px]">
      <h3 class="text-xs text-gray-800 dark:text-gray-200 line-clamp-2 min-h-[32px] mb-1 leading-tight">{{ product.name
        }}</h3>

      <div class="mt-auto space-y-1">
        <!-- Tags -->
        <div class="flex flex-wrap gap-1 mb-1" v-if="product.isFreeShipping || product.isVoucher">
          <span v-if="product.isFreeShipping"
            class="border border-[#00bfa5] text-[#00bfa5] text-[10px] px-1 py-0.5 leading-none">Miễn phí trả hàng</span>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-primary font-medium flex items-baseline">
            <span class="text-[10px] mr-0.5">₫</span>
            <span class="text-base">{{ formatPrice(product.price) }}</span>
          </div>
          <div class="text-[10px] text-gray-500 dark:text-gray-400">
            Đã bán {{ formatNumber(product.soldCount) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductSummary } from '@/types';

defineProps<{
  product: ProductSummary
}>()

const formatPrice = (price: number) => {
  return price?.toLocaleString('vi-VN')
}


const formatNumber = (num: number) => {
  if (!num) return '0'
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>

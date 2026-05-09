<template>
  <div class="bg-white dark:bg-card-dark mt-4 shadow-sm">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-4">
          <!-- Flash Sale Logo (SVG or Text) -->
          <div class="flex items-center space-x-2 text-primary">
            <Zap class="w-6 h-6 fill-primary" />
            <h2 class="text-xl font-extrabold italic uppercase tracking-wider">{{ $t('storefront.flashSale') }}</h2>
          </div>
          
          <!-- Countdown -->
          <CountDown :targetDate="targetDate" class="text-sm" />
        </div>
        
        <a href="#" class="text-primary text-sm flex items-center hover:underline">
          {{ $t('storefront.viewAll') }}
          <ChevronRight class="w-4 h-4 ml-1" />
        </a>
      </div>
      
      <div class="py-4 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div class="flex gap-4 min-w-max">
          <!-- Flash Sale Items -->
          <div v-for="product in products" :key="product.id" class="w-[180px] group cursor-pointer">
            <div class="relative aspect-square bg-gray-100 rounded-sm overflow-hidden mb-2">
              <img :src="product.image" :alt="product.name" class="w-full h-full object-cover">
              <div v-if="product.discountPercentage" class="absolute top-0 right-0 bg-[#ffd839] text-[#ee4d2d] px-1 py-0.5 flex flex-col items-center justify-center opacity-90 rounded-bl-sm">
                <span class="text-[10px] font-bold leading-none">{{ product.discountPercentage }}%</span>
                <span class="text-[10px] font-bold leading-none uppercase">{{ $t('storefront.discount') }}</span>
              </div>
              
              <!-- Special Flash Sale overlay styling if needed -->
            </div>
            
            <div class="flex justify-center text-primary font-medium flex items-baseline mb-2">
              <span class="text-xs mr-0.5">₫</span>
              <span class="text-lg">{{ formatPrice(product.price) }}</span>
            </div>
            
            <!-- Progress bar for sold items -->
            <div class="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center">
              <div 
                class="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ffb000] to-[#ee4d2d] rounded-full z-0"
                :style="`width: ${product.soldPercentage}%`"
              ></div>
              <span class="relative z-10 text-[10px] text-white font-bold uppercase drop-shadow-md shadow-black">
                {{ product.soldPercentage >= 100 ? $t('storefront.soldOut') : $t('storefront.soldCount', { count: product.soldCount }) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CountDown } from '@hivespace/shared'
import { Zap, ChevronRight } from 'lucide-vue-next'

// Mock Data
const targetDate = ref(new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()) // 2 hours from now

const products = [
  { id: '1', name: 'Product 1', price: 99000, image: 'https://picsum.photos/200?random=11', discountPercentage: 50, soldCount: 120, soldPercentage: 80 },
  { id: '2', name: 'Product 2', price: 150000, image: 'https://picsum.photos/200?random=12', discountPercentage: 30, soldCount: 85, soldPercentage: 60 },
  { id: '3', name: 'Product 3', price: 45000, image: 'https://picsum.photos/200?random=13', discountPercentage: 45, soldCount: 300, soldPercentage: 95 },
  { id: '4', name: 'Product 4', price: 890000, image: 'https://picsum.photos/200?random=14', discountPercentage: 15, soldCount: 200, soldPercentage: 100 },
  { id: '5', name: 'Product 5', price: 25000, image: 'https://picsum.photos/200?random=15', discountPercentage: 60, soldCount: 500, soldPercentage: 99 },
  { id: '6', name: 'Product 6', price: 340000, image: 'https://picsum.photos/200?random=16', discountPercentage: 20, soldCount: 45, soldPercentage: 30 },
]

const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN')
}
</script>

<template>
  <div class="bg-white dark:bg-card-dark py-4">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row gap-4 h-[200px] md:h-[300px] lg:h-[400px]">
        
        <!-- Main Carousel (Placeholder for Swiper) -->
        <div class="w-full md:w-2/3 lg:w-3/4 h-full bg-gray-200 dark:bg-gray-800 rounded shadow-sm relative overflow-hidden group">
          <img src="https://picsum.photos/800/400" alt="Banner 1" class="w-full h-full object-cover" />
          
          <div class="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            <span class="w-2 h-2 rounded-full bg-white opacity-100"></span>
            <span class="w-2 h-2 rounded-full bg-white opacity-50"></span>
            <span class="w-2 h-2 rounded-full bg-white opacity-50"></span>
            <span class="w-2 h-2 rounded-full bg-white opacity-50"></span>
          </div>
          
          <button class="absolute top-1/2 left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft class="w-5 h-5" />
          </button>
          
          <button class="absolute top-1/2 right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight class="w-5 h-5" />
          </button>
        </div>

        <!-- Side Banners -->
        <div class="hidden md:flex flex-col gap-4 w-1/3 lg:w-1/4 h-full">
          <div class="h-[calc(50%-0.5rem)] bg-gray-200 dark:bg-gray-800 rounded shadow-sm overflow-hidden">
            <img src="https://picsum.photos/400/200?random=1" alt="Side Banner 1" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>
          <div class="h-[calc(50%-0.5rem)] bg-gray-200 dark:bg-gray-800 rounded shadow-sm overflow-hidden">
            <img src="https://picsum.photos/400/200?random=2" alt="Side Banner 2" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
</script>

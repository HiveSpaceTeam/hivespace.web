<template>
  <div class="pb-16 bg-[#f5f5f5] dark:bg-surface-dark min-h-screen">
    <div class="h-4"></div> <!-- Top spacer -->
    
    <div class="container mx-auto">
      <HeroBanner />
      <CategoryBar />
      <FlashSale />
      
      <!-- Sticky Tabs for Product Sections -->
      <div class="mt-8 mb-4 sticky top-[130px] z-40 bg-white dark:bg-card-dark shadow-sm h-14 border-b-2 border-primary container mx-auto flex items-center justify-center">
        <h2 class="text-primary font-bold text-lg uppercase tracking-wider relative px-8 py-4 h-full flex items-center justify-center bg-white dark:bg-card-dark">
          {{ $t('storefront.todaysSuggestions') }}
          <div class="absolute bottom-0 left-0 w-full h-[3px] bg-primary"></div>
        </h2>
      </div>

      <!-- Main Product Grid -->
      <ProductGrid :products="products" />
      
      <div class="mt-8 flex justify-center">
        <Button @click="handleSeeMore" variant="outline" class="px-32 py-2.5 uppercase text-sm font-medium w-full sm:w-auto">
          {{ $t('storefront.seeMore') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import HeroBanner from '@/components/home/HeroBanner.vue'
import CategoryBar from '@/components/home/CategoryBar.vue'
import FlashSale from '@/components/home/FlashSale.vue'
import ProductGrid from '@/components/home/ProductGrid.vue'
import { Button } from '@hivespace/shared'
import { useProductStore } from '@/stores'

const productStore = useProductStore()
const { homeProducts: products } = storeToRefs(productStore)
const pageIndex = ref(1)
const pageSize = ref(12)


onMounted(async () => {
  productStore.resetHomeProducts()
  await fetchProducts()
})


const handleSeeMore = () => {
  pageIndex.value += 1
  void fetchProducts()
}

const fetchProducts = async () => {
  try {
    await productStore.fetchHomeProducts({
      page: pageIndex.value,
      pageSize: pageSize.value,
    }, pageIndex.value > 1)
  } catch (err) {
    // Errors are centrally handled in api service; keep console for dev context
    console.error('Failed to fetch products', err)
  }
}
</script>

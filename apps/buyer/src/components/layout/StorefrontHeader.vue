<template>
  <AppHeader :show-sidebar-toggle="false">
    <!-- Bottom Search Bar Area -->
    <template #bottom>
      <div class="bg-surface dark:bg-surface-dark py-4 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div class="container mx-auto flex items-center justify-center gap-8 flex-wrap lg:flex-nowrap px-4">
          <!-- Logo -->
          <router-link to="/" class="flex items-center shrink-0">
            <img class="dark:hidden h-8" :src="LogoLight" alt="HiveSpace" />
            <img class="hidden dark:block h-8" :src="LogoDark" alt="HiveSpace" />
          </router-link>

          <!-- Search Bar -->
          <div class="flex-grow flex flex-col min-w-0 mx-4">
            <div
              class="flex bg-white dark:bg-gray-800 rounded-sm p-1 shadow-sm focus-within:ring-2 focus-within:ring-primary-light transition-shadow border border-gray-300 dark:border-gray-700">
              <input type="text"
                class="w-full px-3 py-2 text-gray-800 dark:text-gray-100 bg-transparent focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                :placeholder="$t('storefront.search')" />
              <button class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-sm transition-colors">
                <Search class="w-5 h-5" />
              </button>
            </div>
            <div v-if="false" class="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
              <a href="#" class="hover:text-primary transition-colors truncate">iPhone 15</a>
              <a href="#" class="hover:text-primary transition-colors truncate">Tai nghe Bluetooth</a>
              <a href="#" class="hover:text-primary transition-colors truncate">Áo thun nam</a>
              <a href="#" class="hover:text-primary transition-colors truncate lg:inline-block hidden">Túi xách nữ</a>
            </div>
          </div>

          <!-- Cart Icon -->
          <div class="relative cursor-pointer min-w-[50px] flex justify-end">
            <router-link to="/cart"
              class="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors relative block p-2">
              <ShoppingCart class="w-8 h-8" />
              <span v-if="selectedCount > 0"
                class="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-surface dark:border-surface-dark">
                {{ selectedCount }}
              </span>
            </router-link>
          </div>
        </div>
      </div>
    </template>
  </AppHeader>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import AppHeader from "./AppHeader.vue";
import LogoLight from "@/assets/logo/logo-light.svg";
import LogoDark from "@/assets/logo/logo-dark.svg";
import { Search, ShoppingCart } from "lucide-vue-next";
import { useAuth } from '@hivespace/shared'
import { useCartStore } from '@/stores/cart.store'

const { currentUser } = useAuth()
const cartStore = useCartStore()
const { selectedCount } = storeToRefs(cartStore)

watch(currentUser, (user, prevUser) => { if (user && !prevUser) cartStore.fetchSelectedCount() }, { immediate: true })
</script>

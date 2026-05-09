<template>
  <AppHeader :show-sidebar-toggle="false">
    <template #bottom>
      <div class="bg-surface dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between gap-6">
            <!-- Left: Logo + Divider + "Giỏ Hàng" -->
            <div class="flex items-center gap-4 shrink-0">
              <router-link to="/" class="flex items-center">
                <img class="dark:hidden h-8" :src="LogoLight" alt="HiveSpace" />
                <img class="hidden dark:block h-8" :src="LogoDark" alt="HiveSpace" />
              </router-link>
              <div class="h-6 w-px bg-primary"></div>
              <span class="text-xl text-primary font-medium">Giỏ Hàng</span>
            </div>

            <!-- Right: Search Bar -->
            <div class="flex-grow max-w-xl hidden sm:block">
              <div
                class="flex bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary-light transition-shadow">
                <input type="text"
                  class="w-full px-3 py-1.5 text-sm text-gray-800 dark:text-gray-100 bg-transparent focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  :placeholder="$t('storefront.search')" />
                <Button variant="primary" :aria-label="$t('storefront.search')" class="px-5 py-1.5 rounded-none rounded-r-sm">
                  <Search class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <!-- Footer slot for additional content -->
        <slot name="footer" />
      </div>
    </template>
  </AppHeader>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import LogoLight from '@/assets/logo/logo-light.svg'
import LogoDark from '@/assets/logo/logo-dark.svg'
import { Search } from 'lucide-vue-next'
import { Button } from '@hivespace/shared';
</script>

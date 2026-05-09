<template>
  <AppHeader :show-sidebar-toggle="false">
    <template #bottom>
      <div class="bg-surface dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between gap-6">
            <!-- Left: Logo + Divider + "Thanh Toán" -->
            <div class="flex items-center gap-4 shrink-0">
              <router-link to="/" class="flex items-center">
                <img class="dark:hidden h-8" :src="LogoLight" alt="HiveSpace" />
                <img class="hidden dark:block h-8" :src="LogoDark" alt="HiveSpace" />
              </router-link>
              <div class="h-6 w-px bg-primary"></div>
              <span class="text-xl text-primary font-medium">{{ $t('checkout.title') }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppHeader>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import LogoLight from '@/assets/logo/logo-light.svg'
import LogoDark from '@/assets/logo/logo-dark.svg'
</script>

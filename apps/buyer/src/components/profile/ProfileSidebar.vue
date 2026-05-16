<template>
  <aside class="w-52 shrink-0">
    <div class="bg-white dark:bg-card-dark rounded shadow-sm overflow-hidden">
      <div class="flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-700">
        <Avatar size="medium" />
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
            {{ displayUsername }}
          </p>
          <RouterLink
            to="/profile"
            class="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors mt-0.5"
          >
            <Pencil class="w-3 h-3" />
            {{ $t('storefront.profilePage.editProfile') }}
          </RouterLink>
        </div>
      </div>

      <nav class="py-2">
        <RouterLink
          to="/notifications"
          class="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Bell class="w-4 h-4 shrink-0" />
          {{ $t('storefront.profilePage.navNotifications') }}
        </RouterLink>

        <div>
          <button
            @click="accountOpen = !accountOpen"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <User class="w-4 h-4 shrink-0 text-primary" />
            <span class="flex-1 text-left">{{ $t('storefront.profilePage.navMyAccount') }}</span>
            <ChevronDown
              class="w-3.5 h-3.5 transition-transform"
              :class="accountOpen ? 'rotate-180' : ''"
            />
          </button>
          <div v-show="accountOpen" class="pl-11 pr-3 pb-1 flex flex-col gap-0.5">
            <RouterLink
              to="/profile"
              class="block px-3 py-1.5 text-sm font-semibold rounded transition-colors"
              :class="activeClass('/profile')"
            >
              {{ $t('storefront.profilePage.navProfile') }}
            </RouterLink>
            <RouterLink
              to="/profile/address"
              class="block px-3 py-1.5 text-sm font-semibold rounded transition-colors"
              :class="activeClass('/profile/address')"
            >
              {{ $t('storefront.profilePage.navAddress') }}
            </RouterLink>
          </div>
        </div>

        <RouterLink
          to="/orders"
          class="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors"
          :class="
            route.path === '/orders'
              ? 'text-primary'
              : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'
          "
        >
          <ShoppingBag class="w-4 h-4 shrink-0 text-primary" />
          {{ $t('storefront.profilePage.navMyOrders') }}
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuth, Avatar } from '@hivespace/shared'
import { Bell, User, ShoppingBag, ChevronDown, Pencil } from 'lucide-vue-next'

const route = useRoute()
const { currentUser } = useAuth()

const accountOpen = ref(true)

const displayUsername = computed(
  () =>
    currentUser.value?.profile?.preferred_username ??
    currentUser.value?.profile?.name ??
    currentUser.value?.profile?.sub ??
    '',
)

const activeClass = (path: string) =>
  route.path === path
    ? 'text-primary'
    : 'text-gray-500 dark:text-gray-400 hover:text-primary'
</script>

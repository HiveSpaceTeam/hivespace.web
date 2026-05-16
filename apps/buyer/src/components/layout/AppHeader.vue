<template>
  <header :class="[
    'sticky top-0 flex flex-col w-full border-gray-200 z-999 dark:border-gray-800 lg:border-b',
    headerClass || 'bg-white dark:bg-gray-900'
  ]">
    <div
      :class="['flex flex-col items-center justify-between grow lg:flex-row lg:px-6 w-full relative z-10', containerClass]">
      <div
        class="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">

        <button @click="toggleApplicationMenu"
          :aria-label="isApplicationMenuOpen ? $t('storefront.header.closeApplicationMenu') : $t('storefront.header.openApplicationMenu')"
          :aria-expanded="isApplicationMenuOpen" aria-controls="application-menu"
          class="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden">
          <MoreVertical class="w-6 h-6" />
        </button>
        <HeaderLogo />

        <div class="relative hidden lg:block lg:ml-6 lg:min-w-[280px] lg:max-w-[420px] lg:flex-1">
          <SearchIcon class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            :placeholder="$t('storefront.header.searchPlaceholder')"
            class="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-10 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-brand-300 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
          />
        </div>

        <button @click="toggleApplicationMenu"
          :aria-label="isApplicationMenuOpen ? $t('storefront.header.closeApplicationMenu') : $t('storefront.header.openApplicationMenu')"
          :aria-expanded="isApplicationMenuOpen" aria-controls="application-menu"
          class="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden">
          <MoreVertical class="w-6 h-6" />
        </button>
      </div>

      <div :class="[isApplicationMenuOpen ? 'flex' : 'hidden']"
        class="items-center justify-between w-full gap-4 px-5 py-4 shadow-theme-md lg:flex lg:justify-end lg:px-0 lg:shadow-none">
        <div class="flex items-center gap-2 2xsm:gap-3">
          <ThemeToggler @theme-changed="handleThemeChange" />
          <LanguageSwitcher @language-changed="handleCultureChange" />
          <NotificationMenu v-if="currentUser" :notifications="notifications" :unread-count="unreadCount"
            :is-loading="notificationLoading" :has-more="hasMore" view-all-to="/notifications"
            @notification-read="notificationStore.markAsRead" @notification-clicked="notificationStore.markAsRead"
            @open="(unreadOnly: boolean) => notificationStore.fetchNotifications(unreadOnly)"
            @filter-change="(unreadOnly: boolean) => notificationStore.fetchNotifications(unreadOnly)"
            @load-more="notificationStore.loadMore" @view-all="() => router.push('/notifications')" />
        </div>
        <UserMenu v-if="currentUser" :user="currentUser" :menu-items="menuItems" :show-sign-out="true"
          @sign-out="logout" @navigate="handleNavigate" />
        <div v-else class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 ml-4 h-10">
          <button @click="register()" class="px-2 py-1 hover:text-primary transition-colors cursor-pointer">{{
            $t('common.auth.signUp') }}</button>
          <span class="text-gray-300 dark:text-gray-700">|</span>
          <button @click="login()" class="px-2 py-1 hover:text-primary transition-colors cursor-pointer">{{
            $t('common.auth.signIn') }}</button>
        </div>
      </div>
    </div>
    <slot name="bottom" />
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import {
  useAuth,
  type MenuItem,
  type ThemeText,
  type CultureText,
  HeaderLogo,
  ThemeToggler,
  LanguageSwitcher,
  NotificationMenu,
  UserMenu
} from '@hivespace/shared'
import { MoreVertical, UserCircle, ShoppingBag } from 'lucide-vue-next'
import { SearchIcon } from '@hivespace/shared'
import { useUserSettingsStore } from '@/stores/user-settings.store'
import { useNotificationStore } from '@/stores'

interface Props {
  headerClass?: string
  containerClass?: string
}

withDefaults(defineProps<Props>(), {
  headerClass: 'bg-surface dark:bg-surface-dark',
  containerClass: 'container mx-auto',
})

const { currentUser: user, getCurrentUser, logout, login, register } = useAuth()
const currentUser = computed(() => user.value)
const userStore = useUserSettingsStore()
const router = useRouter()
const notificationStore = useNotificationStore()
const { notifications, unreadCount, isLoading: notificationLoading, hasMore } = storeToRefs(notificationStore)

const handleNavigate = (path: string) => {
  router.push(path)
}

const menuItems: MenuItem[] = [
  { href: '/profile', icon: UserCircle, textKey: 'storefront.profile.myAccount' },
  { href: '/orders', icon: ShoppingBag, textKey: 'storefront.profile.myOrders' },
]

const isApplicationMenuOpen = ref(false)

const toggleApplicationMenu = () => {
  isApplicationMenuOpen.value = !isApplicationMenuOpen.value
}

const handleThemeChange = async (theme: ThemeText) => {
  await userStore.updateTheme(theme)
}

const handleCultureChange = async (culture: CultureText) => {
  await userStore.updateCulture(culture)
}

onMounted(async () => {
  await getCurrentUser()
})
</script>

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
          <ThemeToggler @theme-changed="themeChange" />
          <LanguageSwitcher @language-changed="cultureChange" />
          <NotificationMenu v-if="currentUser" :notifications="notifications" :unread-count="unreadCount"
            :is-loading="notificationLoading" :has-more="hasMore" view-all-to="/notifications"
            @notification-read="markAsRead" @notification-clicked="markAsRead"
            @open="(unreadOnly: boolean) => fetchNotifications(unreadOnly)"
            @filter-change="(unreadOnly: boolean) => fetchNotifications(unreadOnly)" @load-more="loadMore"
            @view-all="() => router.push('/notifications')" />
        </div>
        <UserMenu v-if="currentUser" :user="currentUser" :menu-items="menuItems ?? []"
          :display-name="resolvedDisplayName" :full-name="resolvedFullName" :email="resolvedEmail"
          :avatar-src="resolvedAvatarSrc" :show-sign-out="true" @sign-out="handleSignOut" @navigate="handleNavigate" />
        <div v-else class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 ml-4 h-10">
          <button @click="goToSignUp" class="px-2 py-1 hover:text-primary transition-colors cursor-pointer">{{
            $t('common.auth.signUp') }}</button>
          <span class="text-gray-300 dark:text-gray-700">|</span>
          <button @click="goToSignIn" class="px-2 py-1 hover:text-primary transition-colors cursor-pointer">{{
            $t('common.auth.signIn') }}</button>
        </div>
      </div>
    </div>
    <slot name="bottom" />
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  useAuth,
  useAppShell,
  HeaderLogo,
  ThemeToggler,
  LanguageSwitcher,
  NotificationMenu,
  UserMenu
} from '@hivespace/shared'
import { MoreVertical } from 'lucide-vue-next'
import { useProfileStore } from '@/stores'

interface Props {
  headerClass?: string
  containerClass?: string
}

withDefaults(defineProps<Props>(), {
  headerClass: 'bg-surface dark:bg-surface-dark',
  containerClass: 'container mx-auto',
})

const { currentUser: user, getCurrentUser, logout } = useAuth()
const currentUser = computed(() => user.value)
const router = useRouter()
const profileStore = useProfileStore()
const {
  notifications,
  unreadCount,
  notificationLoading,
  hasMore,
  menuItems,
  markAsRead,
  fetchNotifications,
  loadMore,
  currentUserDisplayName,
  currentUserFullName,
  currentUserEmail,
  currentUserAvatarSrc,
  loadCurrentUserProfile,
  themeChange,
  cultureChange,
} = useAppShell()

const tokenUserName = computed(() => (
  typeof user.value?.profile?.username === 'string' ? user.value.profile.username : ''
))
const tokenFullName = computed(() => (
  typeof user.value?.profile?.name === 'string' ? user.value.profile.name : ''
))
const tokenEmail = computed(() => (
  typeof user.value?.profile?.email === 'string' ? user.value.profile.email : ''
))
const tokenAvatarSrc = computed(() => (
  typeof user.value?.profile?.picture === 'string' ? user.value.profile.picture : ''
))

const resolvedDisplayName = computed(() => (
  currentUserDisplayName?.value || tokenUserName.value || tokenFullName.value || ''
))
const resolvedFullName = computed(() => (
  currentUserFullName?.value || tokenFullName.value || resolvedDisplayName.value
))
const resolvedEmail = computed(() => currentUserEmail?.value || tokenEmail.value || '')
const resolvedAvatarSrc = computed(() => currentUserAvatarSrc?.value || tokenAvatarSrc.value || '')
const isProfileLoading = ref(false)

const loadProfileForCurrentUser = async (force = false) => {
  if (!loadCurrentUserProfile || !user.value || isProfileLoading.value) return

  try {
    isProfileLoading.value = true
    await loadCurrentUserProfile(force)
  } catch (error) {
    console.error('Failed to load current user profile:', error)
  } finally {
    isProfileLoading.value = false
  }
}

const handleNavigate = (path: string) => {
  router.push(path)
}

const authReturnUrl = () => {
  const currentPath = router.currentRoute.value.fullPath
  return currentPath === '/signin' || currentPath === '/signup' ? '/' : currentPath
}

const goToSignIn = () => {
  router.push({ path: '/signin', query: { returnUrl: authReturnUrl() } })
}

const goToSignUp = () => {
  router.push({ path: '/signup', query: { returnUrl: authReturnUrl() } })
}

const handleSignOut = async () => {
  await logout()
  profileStore.clearMyProfile()
  await router.push('/')
}

const isApplicationMenuOpen = ref(false)

const toggleApplicationMenu = () => {
  isApplicationMenuOpen.value = !isApplicationMenuOpen.value
}

onMounted(async () => {
  await getCurrentUser()
  await loadProfileForCurrentUser(true)
})

watch(user, async (nextUser, previousUser) => {
  if (nextUser && !previousUser) {
    await loadProfileForCurrentUser(true)
  }
})
</script>

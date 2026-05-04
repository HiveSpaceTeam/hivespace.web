<template>
  <header
    class="sticky top-0 flex w-full bg-white border-gray-200 z-999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
    <div class="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
      <div
        class="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
        <button v-if="props.showSidebarToggle" @click="handleToggle"
          :aria-label="isMobileOpen ? $t('common.sidebar.close') : $t('common.sidebar.open')"
          :aria-expanded="isMobileOpen"
          class="flex items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-999 dark:border-gray-800 dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
          :class="[isMobileOpen ? 'lg:bg-transparent dark:lg:bg-transparent bg-gray-100 dark:bg-gray-800' : '']">
          <CloseMenuIcon v-if="isMobileOpen" />
          <MenuIcon v-else />
        </button>
        <div v-else class="w-10 h-10 lg:w-11 lg:h-11"></div>
        <button @click="toggleApplicationMenu"
          :aria-label="isApplicationMenuOpen ? $t('pages.header.closeApplicationMenu') : $t('pages.header.openApplicationMenu')"
          :aria-expanded="isApplicationMenuOpen" aria-controls="application-menu"
          class="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden">
          <MenuDotsIcon />
        </button>
        <HeaderLogo />
        <button @click="toggleApplicationMenu"
          class="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden">
          <MenuDotsIcon />
        </button>
      </div>

      <div :class="[isApplicationMenuOpen ? 'flex' : 'hidden']"
        class="items-center justify-between w-full gap-4 px-5 py-4 shadow-theme-md lg:flex lg:justify-end lg:px-0 lg:shadow-none">
        <div class="flex items-center gap-2 2xsm:gap-3">
          <ThemeToggler @theme-changed="themeChange" />
          <LanguageSwitcher @language-changed="cultureChange" />
          <NotificationMenu :notifications="notifications" :unread-count="unreadCount"
            :is-loading="notificationLoading" :has-more="hasMore" view-all-to="/notifications"
            @notification-read="markAsRead" @notification-clicked="markAsRead"
            @open="(unreadOnly: boolean) => fetchNotifications(unreadOnly)"
            @filter-change="(unreadOnly: boolean) => fetchNotifications(unreadOnly)"
            @load-more="loadMore" @view-all="() => router.push('/notifications')" />
        </div>
        <UserMenu
          :user="user"
          :menu-items="menuItems ?? []"
          :display-name="resolvedDisplayName"
          :full-name="resolvedFullName"
          :email="resolvedEmail"
          :avatar-src="resolvedAvatarSrc"
          :show-sign-out="true"
          @sign-out="logout"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import CloseMenuIcon from '../../icons/CloseMenuIcon.vue'
import MenuIcon from '../../icons/MenuIcon.vue'
import MenuDotsIcon from '../../icons/MenuDotsIcon.vue'
import HeaderLogo from './header/HeaderLogo.vue'
import ThemeToggler from '../common/ThemeToggler.vue'
import LanguageSwitcher from './header/LanguageSwitcher.vue'
import NotificationMenu from './header/NotificationMenu.vue'
import UserMenu from './header/UserMenu.vue'
import { useSidebar } from '../../composables/useSidebar'
import { useAuth } from '../../composables/useAuth'
import { useAppShell } from '../../composables/useAppShell'

const props = withDefaults(defineProps<{ showSidebarToggle?: boolean }>(), { showSidebarToggle: true })

const {
  notifications, unreadCount, notificationLoading, hasMore,
  menuItems, markAsRead, fetchNotifications, loadMore,
  currentUserDisplayName, currentUserFullName, currentUserEmail, currentUserAvatarSrc,
  themeChange, cultureChange,
} = useAppShell()

const { currentUser: user, getCurrentUser, logout } = useAuth()
const router = useRouter()
const { toggleSidebar, toggleMobileSidebar, isMobileOpen } = useSidebar()

const tokenUserName = computed(() => {
  return typeof user.value?.profile?.username === 'string' ? user.value.profile.username : ''
})

const tokenFullName = computed(() => {
  return typeof user.value?.profile?.name === 'string' ? user.value.profile.name : ''
})

const tokenEmail = computed(() => {
  return typeof user.value?.profile?.email === 'string' ? user.value.profile.email : ''
})

const tokenAvatarSrc = computed(() => {
  return typeof user.value?.profile?.picture === 'string' ? user.value.profile.picture : ''
})

const handleToggle = () => {
  if (window.innerWidth >= 1024) {
    toggleSidebar()
  } else {
    toggleMobileSidebar()
  }
}

const isApplicationMenuOpen = ref(false)

const resolvedDisplayName = computed(() => {
  return currentUserDisplayName?.value
    || tokenUserName.value
    || tokenFullName.value
    || ''
})

const resolvedFullName = computed(() => {
  return currentUserFullName?.value
    || tokenFullName.value
    || resolvedDisplayName.value
})

const resolvedEmail = computed(() => {
  return currentUserEmail?.value
    || tokenEmail.value
    || ''
})

const resolvedAvatarSrc = computed(() => {
  return currentUserAvatarSrc?.value
    || tokenAvatarSrc.value
    || ''
})

const toggleApplicationMenu = () => {
  isApplicationMenuOpen.value = !isApplicationMenuOpen.value
}

onMounted(async () => {
  await getCurrentUser()
})
</script>

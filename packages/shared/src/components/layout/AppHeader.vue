<template>
  <header class="sticky top-0 z-999 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
    <div class="flex h-[68px] items-center justify-between gap-4 px-4 md:px-6 lg:px-7">
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <button v-if="props.showSidebarToggle" @click="handleToggle"
          :aria-label="isMobileOpen ? $t('common.sidebar.close') : $t('common.sidebar.open')"
          :aria-expanded="isMobileOpen"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 lg:hidden">
          <CloseMenuIcon v-if="isMobileOpen" />
          <MenuIcon v-else />
        </button>

        <div class="relative hidden max-w-[480px] flex-1 lg:block">
          <SearchIcon class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="search" placeholder="Search admin workspace..."
            class="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-10 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-brand-300 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200" />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <ThemeToggler @theme-changed="themeChange" />
        <LanguageSwitcher @language-changed="cultureChange" />
        <NotificationMenu :notifications="notifications" :unread-count="unreadCount" :is-loading="notificationLoading"
          :has-more="hasMore" view-all-to="/notifications" @notification-read="markAsRead"
          @notification-clicked="markAsRead" @open="(unreadOnly: boolean) => fetchNotifications(unreadOnly)"
          @filter-change="(unreadOnly: boolean) => fetchNotifications(unreadOnly)" @load-more="loadMore"
          @view-all="() => router.push('/notifications')" />
        <UserMenu :user="user" :menu-items="menuItems ?? []" :display-name="resolvedDisplayName"
          :full-name="resolvedFullName" :email="resolvedEmail" :avatar-src="resolvedAvatarSrc" :show-sign-out="true"
          @sign-out="logout" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CloseMenuIcon from '../../icons/CloseMenuIcon.vue'
import MenuIcon from '../../icons/MenuIcon.vue'
import SearchIcon from '../../icons/SearchIcon.vue'
import ThemeToggler from '../common/ThemeToggler.vue'
import LanguageSwitcher from './header/LanguageSwitcher.vue'
import NotificationMenu from './header/NotificationMenu.vue'
import UserMenu from './header/UserMenu.vue'
import { useSidebar } from '../../composables/useSidebar'
import { useAuth } from '../../composables/useAuth'
import { useAppShell } from '../../composables/useAppShell'

const props = withDefaults(defineProps<{ showSidebarToggle?: boolean }>(), { showSidebarToggle: true })

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
  themeChange,
  cultureChange,
} = useAppShell()

const { currentUser: user, getCurrentUser, logout } = useAuth()
const router = useRouter()
const { toggleMobileSidebar, isMobileOpen } = useSidebar()

const tokenUserName = computed(() => (typeof user.value?.profile?.username === 'string' ? user.value.profile.username : ''))
const tokenFullName = computed(() => (typeof user.value?.profile?.name === 'string' ? user.value.profile.name : ''))
const tokenEmail = computed(() => (typeof user.value?.profile?.email === 'string' ? user.value.profile.email : ''))
const tokenAvatarSrc = computed(() => (typeof user.value?.profile?.picture === 'string' ? user.value.profile.picture : ''))

const resolvedDisplayName = computed(() => currentUserDisplayName?.value || tokenUserName.value || tokenFullName.value || '')
const resolvedFullName = computed(() => currentUserFullName?.value || tokenFullName.value || resolvedDisplayName.value)
const resolvedEmail = computed(() => currentUserEmail?.value || tokenEmail.value || '')
const resolvedAvatarSrc = computed(() => currentUserAvatarSrc?.value || tokenAvatarSrc.value || '')

const handleToggle = () => {
  toggleMobileSidebar()
}

onMounted(async () => {
  await getCurrentUser()
})
</script>

<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-999 flex flex-col border-r border-gray-200 bg-white transition-all duration-200 dark:border-gray-800 dark:bg-gray-900',
      isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      isExpanded || isHovered ? 'lg:w-[260px] px-4 py-5' : 'lg:w-[90px] px-2 py-5',
    ]"
    @mouseenter="!isExpanded && setIsHovered(true)"
    @mouseleave="setIsHovered(false)"
  >
    <div :class="['pb-4', isExpanded || isHovered || isMobileOpen ? 'px-3' : 'flex justify-center']">
      <router-link to="/" class="block">
        <template v-if="isExpanded || isHovered || isMobileOpen">
          <img class="dark:hidden h-7 w-auto" src="/images/logo/logo-light.svg" alt="Logo" />
          <img class="hidden dark:block h-7 w-auto" src="/images/logo/logo-dark.svg" alt="Logo" />
        </template>
        <img v-else class="h-7 w-auto" src="/images/logo/logo-icon.svg" alt="Logo" />
      </router-link>
    </div>

    <nav class="flex-1 overflow-y-auto pr-1">
      <div class="space-y-6">
        <div v-for="(menuGroup, groupIndex) in props.menuGroups" :key="groupIndex">
          <h2
            :class="[
              'text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500',
              isExpanded || isHovered || isMobileOpen ? 'px-3' : 'flex justify-center',
            ]"
          >
            <template v-if="isExpanded || isHovered || isMobileOpen">
              {{ menuGroup.title }}
            </template>
            <HorizontalDots v-else />
          </h2>

          <ul class="mt-2 space-y-1">
            <li v-for="(item, index) in menuGroup.items" :key="item.name">
              <button
                v-if="item.subItems"
                @click="toggleSubmenu(groupIndex, index)"
                :class="[
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                  isExpanded || isHovered || isMobileOpen ? 'justify-start' : 'lg:justify-center',
                  isSubmenuOpen(groupIndex, index)
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5',
                ]"
              >
                <component :is="item.icon" class="h-5 w-5 shrink-0" />
                <span v-if="isExpanded || isHovered || isMobileOpen" class="font-semibold">{{ item.name }}</span>
                <ChevronDownIcon
                  v-if="isExpanded || isHovered || isMobileOpen"
                  class="ml-auto h-4 w-4 transition-transform"
                  :class="isSubmenuOpen(groupIndex, index) ? 'rotate-180' : ''"
                />
              </button>

              <router-link
                v-else-if="item.path"
                :to="item.path"
                :class="[
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                  isExpanded || isHovered || isMobileOpen ? 'justify-start' : 'lg:justify-center',
                  isActive(item.path)
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5',
                ]"
              >
                <component :is="item.icon" class="h-5 w-5 shrink-0" />
                <span v-if="isExpanded || isHovered || isMobileOpen" class="font-semibold">{{ item.name }}</span>
                <span
                  v-if="item.badge && (isExpanded || isHovered || isMobileOpen)"
                  :class="[
                    'ml-auto inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
                    badgeClasses[item.badgeTone ?? 'primary'],
                  ]"
                >
                  {{ item.badge }}
                </span>
              </router-link>

              <transition @enter="startTransition" @after-enter="endTransition" @before-leave="startTransition" @after-leave="endTransition">
                <div v-show="isSubmenuOpen(groupIndex, index) && (isExpanded || isHovered || isMobileOpen)">
                  <ul class="ml-8 mt-2 space-y-1">
                    <li v-for="subItem in item.subItems" :key="subItem.name">
                      <router-link
                        :to="subItem.path"
                        :class="[
                          'block rounded-lg px-3 py-2 text-sm font-semibold',
                          isActive(subItem.path)
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5',
                        ]"
                      >
                        {{ subItem.name }}
                      </router-link>
                    </li>
                  </ul>
                </div>
              </transition>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ChevronDownIcon from '../../icons/ChevronDownIcon.vue'
import HorizontalDots from '../../icons/HorizontalDots.vue'
import { useSidebar } from '../../composables/useSidebar'
import type { SidebarMenuGroup } from '../../types/sidebar.types'

const props = defineProps<{
  menuGroups: SidebarMenuGroup[]
}>()

const badgeClasses = {
  primary: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400',
  success: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400',
  light: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300',
  error: 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400',
}

const route = useRoute()
const { isExpanded, isHovered, isMobileOpen, openSubmenu, setIsHovered } = useSidebar()

const isActive = (path: string) => route.path === path

const toggleSubmenu = (groupIndex: number, itemIndex: number) => {
  const key = `${groupIndex}-${itemIndex}`
  openSubmenu.value = openSubmenu.value === key ? null : key
}

const isAnySubmenuRouteActive = computed(() => {
  return props.menuGroups.some((group) =>
    group.items.some((item) => item.subItems && item.subItems.some((subItem) => isActive(subItem.path))),
  )
})

const isSubmenuOpen = (groupIndex: number, itemIndex: number) => {
  const key = `${groupIndex}-${itemIndex}`
  return (
    openSubmenu.value === key ||
    (isAnySubmenuRouteActive.value &&
      props.menuGroups[groupIndex].items[itemIndex].subItems?.some((subItem) => isActive(subItem.path)))
  )
}

const startTransition = (el: Element) => {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = 'auto'
  const height = htmlEl.scrollHeight
  htmlEl.style.height = '0px'
  void htmlEl.offsetHeight
  htmlEl.style.height = `${height}px`
}

const endTransition = (el: Element) => {
  ;(el as HTMLElement).style.height = ''
}
</script>

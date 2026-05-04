<template>
  <div :class="[fullHeight ? 'h-screen' : 'min-h-screen', 'xl:flex']">
    <AppSidebar :menu-groups="menuGroups" />
    <Backdrop />
    <div :class="[
      'transition-all duration-300 ease-in-out',
      fullHeight ? 'flex-1 flex flex-col min-h-0' : 'flex-1',
      isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]',
    ]">
      <AppHeader />
      <div :class="[
        fullHeight ? 'flex-1 min-h-0 flex flex-col' : '',
        'p-4 mx-auto w-full max-w-(--breakpoint-2xl) md:p-6',
      ]">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Backdrop from './Backdrop.vue'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { useSidebar } from '../../composables/useSidebar'
import { useAppShell } from '../../composables/useAppShell'

const { menuGroups, fullHeight } = useAppShell()
const { isExpanded, isHovered } = useSidebar()
</script>

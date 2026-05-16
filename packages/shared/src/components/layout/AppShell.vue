<template>
  <div :class="[fullHeight ? 'min-h-screen' : 'min-h-screen', 'bg-gray-50 dark:bg-gray-950 lg:flex']">
    <AppSidebar :menu-groups="menuGroups" />
    <Backdrop />

    <div class="min-w-0 flex-1 lg:ml-[260px]">
      <AppHeader />

      <main
        :class="[
          fullHeight ? 'min-h-[calc(100vh-68px)]' : '',
          'min-w-0 px-4 py-5 md:px-6 lg:px-7',
        ]"
      >
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Backdrop from './Backdrop.vue'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { useAppShell } from '../../composables/useAppShell'

const { menuGroups, fullHeight } = useAppShell()
</script>

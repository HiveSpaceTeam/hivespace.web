<template>
  <div
    class="min-h-screen flex flex-col bg-surface text-secondary dark:bg-surface-dark dark:text-gray-100"
  >
    <StorefrontHeader />
    <main class="flex-grow">
      <!-- Added pt-32 to account for fixed header -->
      <slot />
    </main>
    <StorefrontFooter />
  </div>
</template>

<script setup lang="ts">
import StorefrontHeader from "./StorefrontHeader.vue";
import StorefrontFooter from "./StorefrontFooter.vue";
</script>

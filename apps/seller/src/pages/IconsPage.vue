<template>

  <div class="space-y-6">
    <!-- Page Header -->
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Icons Gallery</h1>
      <p class="text-gray-600 dark:text-gray-400">
        All available icons in this project. Click on any icon to copy its name.
      </p>
    </div>

    <!-- Icons Grid -->
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        <div v-for="(icon, name) in icons" :key="name" @click="copyIconName(name)"
          class="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200 group"
          :title="`Click to copy: ${name}`">
          <div
            class="w-8 h-8 mb-2 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            <component :is="icon" />
          </div>
          <span
            class="text-xs text-gray-500 dark:text-gray-400 text-center break-all group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {{ name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <div class="text-center">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Icons</h3>
        <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ totalIcons }}</p>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="showToast"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300">
      Icon name copied to clipboard!
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import * as Icons from '@hivespace/shared'

// Remove the default export if it exists and create icons object
const icons = computed(() => {
  const iconMap: Record<string, unknown> = {}
  Object.entries(Icons).forEach(([name, component]) => {
    // Only include component names that end with 'Icon' to avoid other exports like functions/constants
    if (name !== 'default' && name.endsWith('Icon')) {
      iconMap[name] = component
    }
  })
  return iconMap
})

const totalIcons = computed(() => Object.keys(icons.value).length)
const showToast = ref(false)

const copyIconName = async (iconName: string) => {
  try {
    await navigator.clipboard.writeText(iconName)
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 2000)
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = iconName
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)

    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 2000)
  }
}
</script>

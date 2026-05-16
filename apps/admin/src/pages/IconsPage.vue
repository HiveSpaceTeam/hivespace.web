<template>
  <div class="space-y-6">
    <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
      <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('icons.title') }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t('icons.description') }}
      </p>
    </div>

    <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        <div
          v-for="(icon, name) in icons"
          :key="name"
          class="group flex cursor-pointer flex-col items-center justify-center rounded-lg transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          :title="t('icons.copyTitle', { name })"
          @click="copyIconName(name)"
        >
          <div
            class="mb-2 h-8 w-8 text-gray-600 transition-colors duration-200 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400"
          >
            <component :is="icon" />
          </div>
          <span
            class="break-all text-center text-xs text-gray-500 transition-colors duration-200 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400"
          >
            {{ name }}
          </span>
        </div>
      </div>
    </div>

    <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
      <div class="text-center">
        <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('icons.totalLabel') }}
        </h3>
        <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ totalIcons }}</p>
      </div>
    </div>

    <div
      v-if="showToast"
      class="fixed bottom-4 right-4 rounded-lg bg-green-500 px-4 py-2 text-white shadow-lg transition-opacity duration-300"
    >
      {{ t('icons.copiedMessage') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as Icons from '@hivespace/shared'

const { t } = useI18n()

const icons = computed(() => {
  const iconMap: Record<string, unknown> = {}
  Object.entries(Icons).forEach(([name, component]) => {
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

<template>
  <div class="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
    <div class="absolute right-4 top-4 z-10 flex items-center gap-3">
      <ThemeToggler />
      <LanguageSwitcher />
    </div>

    <div>
      <div class="absolute right-0 top-0 -z-1 w-full max-w-62.5 xl:max-w-112.5">
        <img :src="gridShape" alt="grid" />
      </div>
      <div class="absolute bottom-0 left-0 -z-1 w-full max-w-62.5 rotate-180 xl:max-w-112.5">
        <img :src="gridShape" alt="grid" />
      </div>
    </div>
    <div class="mx-auto w-full max-w-60.5 text-center sm:max-w-118">
      <h1 class="text-title-md mb-8 font-bold text-gray-800 dark:text-white/90 xl:text-title-2xl">
        {{ t('common.notFound.title') }}
      </h1>
      <img :src="error404" alt="404" class="dark:hidden" />
      <img :src="error404Dark" alt="404" class="hidden dark:block" />
      <p class="mb-6 mt-10 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
        {{ t('common.notFound.message') }}
      </p>
      <a
        href="/"
        class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200"
      >
        {{ t('common.backHome') }}
      </a>
    </div>
    <p
      class="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-gray-500 dark:text-gray-400"
    >
      &copy; {{ new Date().getFullYear() }} - HiveSpace
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ThemeToggler, LanguageSwitcher } from '../components'
import gridShape from '../assets/images/shape/grid-01.svg'
import error404 from '../assets/images/error/404.svg'
import error404Dark from '../assets/images/error/404-dark.svg'

const { t } = useI18n()
</script>

<style scoped>
/* styling via Tailwind */
</style>

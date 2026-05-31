<template>
  <FullScreenLayout>
    <div class="relative min-h-screen bg-white dark:bg-gray-900">
      <div class="relative flex min-h-screen flex-col justify-center lg:flex-row">
        <section class="relative flex w-full flex-1 items-center justify-center px-6 py-10 lg:w-1/2">
          <div class="absolute right-4 top-4 z-10">
            <LanguageSwitcher />
          </div>

          <div class="w-full max-w-md">
            <div class="mb-8">
              <h1 class="mb-2 text-3xl font-semibold text-gray-900 dark:text-white">
                {{ title }}
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ subtitle }}
              </p>
            </div>

            <slot></slot>
          </div>
        </section>

        <section
          class="relative hidden min-h-screen w-full items-center overflow-hidden bg-brand-950 dark:bg-white/5 lg:grid lg:w-1/2">
          <div class="relative z-1 flex h-full items-center justify-center px-12 py-16">
            <CommonGridShape />

            <div class="flex max-w-md flex-col items-center text-center">
              <img :src="imageSrc" :alt="imageAlt" :class="imageClasses" />
              <h2 class="mb-3 text-3xl font-semibold text-white">{{ imageHeading }}</h2>
              <p class="text-base text-white/70">{{ imageBody }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
import CommonGridShape from '../common/CommonGridShape.vue'
import FullScreenLayout from './FullScreenLayout.vue'
import LanguageSwitcher from './header/LanguageSwitcher.vue'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle: string
    imageSrc: string
    imageAlt: string
    imageHeading: string
    imageBody: string
    imageObjectFit?: 'cover' | 'contain'
    imagePresentation?: 'framed-square' | 'plain-wide'
  }>(),
  {
    imageObjectFit: 'cover',
    imagePresentation: 'framed-square',
  },
)

const imageClasses = [
  'mb-8',
  props.imagePresentation === 'plain-wide'
    ? 'w-full max-w-xs object-contain'
    : [
      'aspect-square w-72 rounded-lg shadow-2xl ring-1 ring-white/10',
      props.imageObjectFit === 'contain' ? 'object-contain' : 'object-cover',
    ],
]
</script>

<template>
  <div class="flex items-start gap-0 overflow-x-auto">
    <div
      v-for="(step, index) in steps"
      :key="step.key"
      class="flex flex-col items-center flex-1 min-w-0"
    >
      <div class="flex items-center w-full">
        <div class="flex-1 h-0.5" :class="index === 0 ? 'invisible' : step.isCompleted || step.isCurrent ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'" />
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors"
          :class="step.isCurrent
            ? 'border-primary bg-primary text-white'
            : step.isCompleted
              ? 'border-primary bg-primary text-white'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'"
        >
          <svg v-if="step.isCompleted || step.isCurrent" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="flex-1 h-0.5" :class="index === steps.length - 1 ? 'invisible' : step.isCompleted ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'" />
      </div>
      <p class="mt-2 text-xs text-center font-medium px-1 truncate w-full" :class="step.isCurrent ? 'text-primary' : step.isCompleted ? 'text-primary' : 'text-gray-400 dark:text-gray-500'">
        {{ step.label }}
      </p>
      <p v-if="step.timestamp" class="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-0.5 px-1">
        {{ step.timestamp }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimelineStep } from './OrderTimeline.types'

defineProps<{ steps: TimelineStep[] }>()
</script>

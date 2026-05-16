<template>
  <span :class="[baseStyles, sizeClass, colorStyles]">
    <span
      v-if="dot"
      :class="['h-1.5 w-1.5 flex-shrink-0 rounded-full', dotColorClass]"
    ></span>
    <span v-if="startIcon" class="mr-1">
      <component :is="startIcon" />
    </span>
    <slot></slot>
    <span v-if="endIcon" class="ml-1">
      <component :is="endIcon" />
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type BadgeVariant = 'light' | 'solid'
type BadgeSize = 'sm' | 'md'
type BadgeColor =
  | 'primary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'violet'
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'fuchsia'
  | 'sky'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  color?: BadgeColor
  dot?: boolean
  dotColorClass?: string
  startIcon?: object
  endIcon?: object
}

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: 'light',
  color: 'primary',
  size: 'md',
  dot: false,
  dotColorClass: '',
})

const baseStyles =
  'inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 font-semibold whitespace-nowrap'

const sizeStyles = {
  sm: 'text-[11px]',
  md: 'text-sm',
}

const variants = {
  light: {
    primary: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400',
    success: 'bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-400',
    error: 'bg-error-100 text-error-700 dark:bg-error-500/15 dark:text-error-400',
    warning: 'bg-warning-100 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400',
    info: 'bg-blue-light-100 text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-400',
    light: 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80',
    dark: 'bg-gray-500 text-white dark:bg-white/5 dark:text-white',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    fuchsia: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-400',
    sky: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',
  },
  solid: {
    primary: 'bg-brand-500 text-white dark:text-white',
    success: 'bg-success-500 text-white dark:text-white',
    error: 'bg-error-500 text-white dark:text-white',
    warning: 'bg-warning-500 text-white dark:text-white',
    info: 'bg-blue-light-500 text-white dark:text-white',
    light: 'bg-gray-400 dark:bg-white/5 text-white dark:text-white/80',
    dark: 'bg-gray-700 text-white dark:text-white',
    violet: 'bg-violet-500 text-white dark:text-white',
    blue: 'bg-blue-500 text-white dark:text-white',
    emerald: 'bg-emerald-500 text-white dark:text-white',
    amber: 'bg-amber-500 text-white dark:text-white',
    fuchsia: 'bg-fuchsia-500 text-white dark:text-white',
    sky: 'bg-sky-500 text-white dark:text-white',
  },
}

const sizeClass = computed(() => sizeStyles[props.size])
const colorStyles = computed(() => variants[props.variant][props.color])
</script>

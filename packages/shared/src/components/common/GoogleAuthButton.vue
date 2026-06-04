<template>
  <Button
    type="button"
    variant="outline"
    :class-name="className"
    :disabled="disabled"
    :loading="loading"
    :on-click="onClick"
  >
    <GoogleIcon v-if="!loading" class="h-5 w-5" />
    <span>{{ label }}</span>
  </Button>
</template>

<script setup lang="ts">
import Button from './Button.vue'
import { GoogleIcon } from '../../icons'

interface GoogleAuthButtonProps {
  label: string
  className?: string
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

withDefaults(defineProps<GoogleAuthButtonProps>(), {
  className: 'w-full',
  disabled: false,
  loading: false,
})
</script>

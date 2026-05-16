<template>
  <div>
    <h1></h1>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@hivespace/shared'

const router = useRouter()
const { handleLoginCallback } = useAuth()

onMounted(async () => {
  let returnToUrl = '/'
  try {
    const result = await handleLoginCallback()
    if (result.state !== undefined) {
      const candidate = (result.state as string) || '/'
      // Only allow relative paths to prevent open redirect attacks
      returnToUrl = /^\/(?!\/)/.test(candidate) ? candidate : '/'
    }
  } catch (error) {
    console.error('Callback error:', error)
    router.replace('/')
    return
  }

  router.push({ path: returnToUrl })
})
</script>

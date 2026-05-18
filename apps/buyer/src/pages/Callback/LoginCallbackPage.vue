<template>
  <div>
    <h1></h1>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@hivespace/shared'
import { useProfileStore } from '@/stores/profile.store'

const router = useRouter()
const { handleLoginCallback } = useAuth()
const profileStore = useProfileStore()

onMounted(async () => {
  let returnToUrl = '/'
  try {
    const result = await handleLoginCallback()
    await profileStore.fetchMyProfile().catch((error) => {
      console.error('Failed to fetch profile after login:', error)
    })
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

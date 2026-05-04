<template>
  <div>
    <h1></h1>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { numericToStringCulture, useAuth } from '@hivespace/shared'
import i18n from '@/i18n'
import { useProfileStore } from '@/stores/profile.store'
import { useUserSettingsStore } from '@/stores/user-settings.store'

const router = useRouter()
const { handleLoginCallback } = useAuth()

onMounted(async () => {
  let returnToUrl = '/product/list'
  try {
    const result = await handleLoginCallback()
    if (result.state !== undefined) {
      returnToUrl = (result.state as string) || returnToUrl
    }
  } catch (error) {
    console.error('Callback error:', error)
    router.replace('/')
    return
  }

  // Settings and profile fetch are non-fatal - failure must not sign the user out.
  const userSettingsStore = useUserSettingsStore()
  const profileStore = useProfileStore()
  const [settingsResult, profileResult] = await Promise.allSettled([
    userSettingsStore.fetchUserSettings(),
    profileStore.fetchMyProfile(),
  ])

  if (settingsResult.status === 'fulfilled') {
    i18n.global.locale.value = numericToStringCulture(settingsResult.value.culture)
  } else {
    console.error('Failed to load user settings, using defaults:', settingsResult.reason)
  }

  if (profileResult.status === 'rejected') {
    console.error('Failed to load user profile, using token fallback:', profileResult.reason)
  }

  router.push({ path: returnToUrl })
})
</script>

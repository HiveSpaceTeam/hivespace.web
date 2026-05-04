<template>
  <div>
    <h1></h1>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { numericToStringCulture, useAuth } from '@hivespace/shared'
import { useUserSettingsStore } from '@/stores/user-settings.store';
import i18n from '@/i18n';

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

  // Settings fetch is non-fatal — failure must not sign the user out
  try {
    const userSettingsStore = useUserSettingsStore()
    const settings = await userSettingsStore.fetchUserSettings()
    i18n.global.locale.value = numericToStringCulture(settings.culture)
  } catch (error) {
    console.error('Failed to load user settings, using defaults:', error)
  }

  router.push({ path: returnToUrl })
})
</script>

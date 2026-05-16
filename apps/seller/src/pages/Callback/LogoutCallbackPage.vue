<template>
  <div class="p-6 text-center">{{ $t('common.auth.signingOut') }}</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@hivespace/shared'
import type { SignoutResponse } from 'oidc-client-ts'
import { useProfileStore } from '@/stores/profile.store'

type SignoutUserState = { redirectTo?: string } | undefined

const router = useRouter()
const profileStore = useProfileStore()

onMounted(async () => {
  try {
    profileStore.clearMyProfile()
    const { userManager } = useAuth()
    if (!userManager) throw new Error('Auth not initialized')
    // Process the redirect response from the IdP
    const response = (await userManager.signoutRedirectCallback()) as SignoutResponse
    // response.userState may contain the object you passed as `state`
    // when initiating the signout. Use it to route inside the SPA.
    const userState = response.userState as SignoutUserState
    let redirectTo = userState?.redirectTo ?? '/'

    // Sanitize redirectTo: only allow internal paths starting with '/'
    if (typeof redirectTo !== 'string') {
      redirectTo = '/'
    } else {
      try {
        const url = new URL(redirectTo, window.location.origin)
        if (url.origin !== window.location.origin || !url.pathname.startsWith('/')) {
          redirectTo = '/'
        } else {
          redirectTo = `${url.pathname}${url.search}${url.hash}`
        }
      } catch {
        redirectTo = '/'
      }
    }

    router.replace(redirectTo)
  } catch {
    // Fallback: send the user to home
    router.replace('/')
  }
})
</script>

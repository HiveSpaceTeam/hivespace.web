<template>
  <div class="p-6 text-center">Signing out...</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@hivespace/shared'
import type { SignoutResponse } from 'oidc-client-ts'

type SignoutUserState = { redirectTo?: string } | undefined

const { userManager } = useAuth()
const router = useRouter()

onMounted(async () => {
  try {
    // Process the redirect response from the IdP
    const response = (await userManager?.signoutRedirectCallback()) as SignoutResponse
    // response.userState may contain the object you passed as `state`
    // when initiating the signout. Use it to route inside the SPA.
    const userState = response.userState as SignoutUserState
    let redirectTo = userState?.redirectTo ?? '/'

    // Sanitize redirectTo: only allow internal paths starting with '/'
    if (
      typeof redirectTo !== 'string' ||
      !redirectTo.startsWith('/') ||
      redirectTo.includes('//')
    ) {
      redirectTo = '/'
    }

    router.replace(redirectTo)
  } catch {
    // Fallback: send the user to home
    router.replace('/')
  }
})
</script>

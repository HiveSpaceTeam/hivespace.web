<template>
  <div class="p-6 text-center">{{ $t('storefront.auth.signingOut') }}</div>
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
  profileStore.clearMyProfile()

  try {
    const { userManager } = useAuth()
    if (!userManager) throw new Error('Auth not initialized')
    const response = (await userManager.signoutRedirectCallback()) as SignoutResponse
    const userState = response.userState as SignoutUserState
    let redirectTo = userState?.redirectTo ?? '/'

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
    router.replace('/')
  }
})
</script>

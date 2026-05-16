<template>
  <div class="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
    <div class="absolute right-4 top-4 z-10 flex items-center gap-3">
      <ThemeToggler />
      <LanguageSwitcher />
    </div>

    <div>
      <div class="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
        <img :src="gridShape" alt="grid" />
      </div>
      <div class="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
        <img :src="gridShape" alt="grid" />
      </div>
    </div>

    <div class="mx-auto w-full max-w-[242px] text-center sm:max-w-[562px]">
      <img class="h-auto w-full dark:hidden" :src="logoLight" alt="home" />
      <img class="hidden h-auto w-full dark:block" :src="logoDark" alt="home" />
      <p class="mb-6 mt-10 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
        {{ t('common.default.welcome') }}
      </p>
      <Button :disabled="isSigningIn" variant="primary" @click="signIn">
        {{ t('common.default.signIn') }}
      </Button>
      <Button
        v-if="showSignUp"
        class="ml-4"
        :disabled="isSigningIn"
        variant="outline"
        @click="signIn"
      >
        {{ t('common.default.signUp') }}
      </Button>
    </div>

    <p
      class="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-gray-500 dark:text-gray-400"
    >
      &copy; {{ new Date().getFullYear() }} - HiveSpace
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ThemeToggler, LanguageSwitcher, Button } from '../components'
import { useAuth } from '../composables'
import gridShape from '../assets/images/shape/grid-01.svg'
import logoLight from '../assets/images/logo/logo-light.svg'
import logoDark from '../assets/images/logo/logo-dark.svg'

interface Props {
  redirectPath: string
  showSignUp?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSignUp: false,
})

const emit = defineEmits<{
  (e: 'navigate', path: string): void
}>()

const { t } = useI18n()
const { getCurrentUser, login } = useAuth()
const isSigningIn = ref(false)

async function checkUserAndRedirect() {
  try {
    const user = await getCurrentUser()
    if (user) {
      emit('navigate', props.redirectPath)
      return user
    }
    return null
  } catch (err) {
    console.error('Error checking current user', err)
    return null
  }
}

onMounted(() => {
  void checkUserAndRedirect()
})

const signIn = async () => {
  if (isSigningIn.value) return
  isSigningIn.value = true
  try {
    await login()
  } catch (err) {
    console.error('Sign-in failed', err)
  } finally {
    isSigningIn.value = false
  }
}
</script>

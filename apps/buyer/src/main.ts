import './assets/main.css'
import '@hivespace/shared/style.css'
import 'vue-final-modal/style.css'

import { createVfm } from 'vue-final-modal'
import i18n from './i18n'
import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import { createPinia } from 'pinia'
import { useProfileStore } from '@/stores/profile.store'
import { useUserSettingsStore } from '@/stores/user-settings.store'
import {
  useAuth,
  CULTURE_TEXT,
  THEME_TEXT,
  initializeAuth,
  getCookie,
} from '@hivespace/shared'
import config from './config'

const initializeApp = async () => {
  const app = createApp(App)
  const pinia = createPinia()
  const vfm = createVfm()

  // 1. Install Core Plugins
  app.use(pinia)
  // 2. Install UI Plugins
  app.use(vfm)
  app.use(i18n)

  // 3. Initialize Business Logic (Auth)
  initializeAuth(config.auth)

  app.use(router)

  // 4. Use logic that depends on plugins/auth
  const { getCurrentUser } = useAuth()
  const profileStore = useProfileStore()
  const userSettingsStore = useUserSettingsStore()

  if (await getCurrentUser()) {
    const [settingsResult] = await Promise.allSettled([
      userSettingsStore.fetchUserSettings(),
      profileStore.fetchMyProfile(),
    ])

    if (settingsResult.status === 'fulfilled') {
      i18n.global.locale.value = settingsResult.value.culture
    }
  } else {
    const cookieCulture = getCookie('culture')
    const culture = cookieCulture === CULTURE_TEXT.ENGLISH
      ? CULTURE_TEXT.ENGLISH
      : CULTURE_TEXT.VIETNAMESE
    i18n.global.locale.value = culture

    const cookieTheme = getCookie('theme')
    const theme = cookieTheme === THEME_TEXT.DARK ? THEME_TEXT.DARK : THEME_TEXT.LIGHT

    userSettingsStore.setUserSettings({ culture, theme })
    profileStore.clearMyProfile()
  }

  return app
}

// Initialize and mount the app
initializeApp().then((app) => {
  app.mount('#app')
})

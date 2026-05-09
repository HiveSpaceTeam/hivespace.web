import './assets/main.css'
import '@hivespace/shared/style.css'
import 'vue-final-modal/style.css'

import { createVfm } from 'vue-final-modal'
import i18n from './i18n'
import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import { createPinia } from 'pinia'
import { useUserSettingsStore } from '@/stores/user-settings.store'
import {
  CULTURE_TEXT,
  THEME_TEXT,
  stringToNumericCulture,
  numericToStringCulture,
  stringToNumericTheme,
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
  initializeAuth(config.auth.oidc)

  app.use(router)

  // 4. Use logic that depends on plugins/auth
  const userSettingsStore = useUserSettingsStore()

  const cookieCulture = getCookie('culture')
  const cultureText = cookieCulture || CULTURE_TEXT.VIETNAMESE
  const numericCulture = stringToNumericCulture(cultureText)
  i18n.global.locale.value = numericToStringCulture(numericCulture)

  const cookieTheme = getCookie('theme')
  const numericTheme = stringToNumericTheme(cookieTheme || THEME_TEXT.LIGHT)

  userSettingsStore.setUserSettings({ culture: numericCulture, theme: numericTheme })

  return app
}

// Initialize and mount the app
initializeApp().then((app) => {
  app.mount('#app')
})

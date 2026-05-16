import '@vueup/vue-quill/dist/vue-quill.snow.css'
import './assets/main.css'
import '@hivespace/shared/style.css'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'
import 'vue-final-modal/style.css'

import { createVfm } from 'vue-final-modal'
import i18n from './i18n'
import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import VueApexCharts from 'vue3-apexcharts'
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
  app.use(VueApexCharts)
  // 3. Initialize Business Logic (Auth)
  initializeAuth(config.auth.oidc)

  app.use(router)

  // 4. Use logic that depends on plugins/auth
  const { isAuthenticated } = useAuth()
  const profileStore = useProfileStore()
  const userSettingsStore = useUserSettingsStore()

  if (await isAuthenticated.value) {
    const [settingsResult] = await Promise.allSettled([
      userSettingsStore.fetchUserSettings(),
      profileStore.fetchMyProfile(),
    ])

    if (settingsResult.status === 'fulfilled') {
      i18n.global.locale.value = settingsResult.value.culture
    }
  } else {
    // For unauthenticated users, read from cookies or use defaults
    // Initialize culture from cookie
    const cookieCulture = getCookie('culture')
    const culture = cookieCulture === CULTURE_TEXT.ENGLISH
      ? CULTURE_TEXT.ENGLISH
      : CULTURE_TEXT.VIETNAMESE
    i18n.global.locale.value = culture

    // Initialize theme from cookie
    const cookieTheme = getCookie('theme')
    const theme = cookieTheme === THEME_TEXT.DARK ? THEME_TEXT.DARK : THEME_TEXT.LIGHT

    userSettingsStore.setUserSettings({
      culture,
      theme,
    })
    profileStore.clearMyProfile()
  }

  return app
}

// Initialize and mount the app
initializeApp().then((app) => {
  app.mount('#app')
})

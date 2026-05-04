import { defineStore, type StoreDefinition } from 'pinia'
import { ref, type Ref } from 'vue'
import {
  DEFAULT_USER_SETTINGS,
  numericToStringCulture,
  numericToStringTheme,
  type CultureText,
  type ThemeText,
  type IUserSettingsService,
  type UserSettings,
} from './user-settings.types'

export interface UserSettingsStoreReturn {
  userSettings: Ref<UserSettings>
  setUserSettings: (settings: UserSettings) => void
  fetchUserSettings: () => Promise<UserSettings>
  updateUserSettings: (settings: UserSettings) => Promise<void>
  updateTheme: (theme: number) => Promise<void>
  updateCulture: (culture: number) => Promise<void>
  getCurrentCulture: () => CultureText
  getCurrentTheme: () => ThemeText
}

export interface UserSettingsStoreState {
  userSettings: UserSettings
}

export type UserSettingsStoreDefinition = StoreDefinition<
  'userSettings',
  UserSettingsStoreState,
  Record<never, never>,
  Omit<UserSettingsStoreReturn, 'userSettings'>
>

export interface UserSettingsStoreOptions {
  service: IUserSettingsService
}

export const createUserSettingsStore = (
  options: UserSettingsStoreOptions,
): UserSettingsStoreDefinition => {
  const { service } = options

  return defineStore('userSettings', () => {
    const userSettings = ref<UserSettings>(DEFAULT_USER_SETTINGS)

    const setUserSettings = (settings: UserSettings) => {
      userSettings.value = settings
    }

    const fetchUserSettings = async () => {
      const settings = await service.getUserSetting()
      userSettings.value = settings
      return settings
    }

    const updateUserSettings = async (settings: UserSettings) => {
      await service.setUserSetting(settings)
      userSettings.value = settings
    }

    const updateTheme = async (theme: number) => {
      await updateUserSettings({ ...userSettings.value, theme })
    }

    const updateCulture = async (culture: number) => {
      await updateUserSettings({ ...userSettings.value, culture })
    }

    const getCurrentCulture = (): CultureText => {
      return numericToStringCulture(userSettings.value.culture)
    }

    const getCurrentTheme = (): ThemeText => {
      return numericToStringTheme(userSettings.value.theme)
    }

    return {
      userSettings,
      setUserSettings,
      fetchUserSettings,
      updateUserSettings,
      updateTheme,
      updateCulture,
      getCurrentCulture,
      getCurrentTheme,
    }
  }) as unknown as UserSettingsStoreDefinition
}

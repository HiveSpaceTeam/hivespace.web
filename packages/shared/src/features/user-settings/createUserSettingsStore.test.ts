import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { createUserSettingsStore } from './createUserSettingsStore'
import {
  CULTURE_TEXT,
  DEFAULT_USER_SETTINGS,
  THEME_TEXT,
  type IUserSettingsService,
  type UserSettings,
} from './user-settings.types'

const makeService = (): jest.Mocked<IUserSettingsService> => ({
  getUserSetting: jest.fn(),
  setUserSetting: jest.fn(),
})

describe('createUserSettingsStore', () => {
  let service: jest.Mocked<IUserSettingsService>

  beforeEach(() => {
    setActivePinia(createPinia())
    service = makeService()
    service.setUserSetting.mockResolvedValue(undefined)
  })

  it('should load settings from the API', async () => {
    const settings: UserSettings = { theme: THEME_TEXT.DARK, culture: CULTURE_TEXT.ENGLISH }
    service.getUserSetting.mockResolvedValue(settings)
    const useStore = createUserSettingsStore({ service })
    const store = useStore()

    const result = await store.fetchUserSettings()

    expect(service.getUserSetting).toHaveBeenCalled()
    expect(result).toEqual(settings)
    expect(store.userSettings).toEqual(settings)
  })

  it('should update state directly when setting user settings', () => {
    service.getUserSetting.mockResolvedValue(DEFAULT_USER_SETTINGS)
    const useStore = createUserSettingsStore({ service })
    const store = useStore()
    const settings: UserSettings = { theme: THEME_TEXT.DARK, culture: CULTURE_TEXT.ENGLISH }

    store.setUserSettings(settings)

    expect(store.userSettings).toEqual(settings)
    expect(service.setUserSetting).not.toHaveBeenCalled()
  })

  it('should call service and update state when updating settings', async () => {
    service.getUserSetting.mockResolvedValue(DEFAULT_USER_SETTINGS)
    const useStore = createUserSettingsStore({ service })
    const store = useStore()
    const settings: UserSettings = { theme: THEME_TEXT.DARK, culture: CULTURE_TEXT.ENGLISH }

    await store.updateUserSettings(settings)

    expect(service.setUserSetting).toHaveBeenCalledWith(settings)
    expect(store.userSettings).toEqual(settings)
  })

  it('should update only the theme', async () => {
    const initial: UserSettings = { theme: THEME_TEXT.LIGHT, culture: CULTURE_TEXT.VIETNAMESE }
    service.getUserSetting.mockResolvedValue(initial)
    const useStore = createUserSettingsStore({ service })
    const store = useStore()
    await store.fetchUserSettings()

    await store.updateTheme(THEME_TEXT.DARK)

    expect(service.setUserSetting).toHaveBeenCalledWith({
      theme: THEME_TEXT.DARK,
      culture: CULTURE_TEXT.VIETNAMESE,
    })
    expect(store.userSettings.theme).toBe(THEME_TEXT.DARK)
  })

  it('should update only the culture', async () => {
    const initial: UserSettings = { theme: THEME_TEXT.LIGHT, culture: CULTURE_TEXT.VIETNAMESE }
    service.getUserSetting.mockResolvedValue(initial)
    const useStore = createUserSettingsStore({ service })
    const store = useStore()
    await store.fetchUserSettings()

    await store.updateCulture(CULTURE_TEXT.ENGLISH)

    expect(service.setUserSetting).toHaveBeenCalledWith({
      theme: THEME_TEXT.LIGHT,
      culture: CULTURE_TEXT.ENGLISH,
    })
    expect(store.userSettings.culture).toBe(CULTURE_TEXT.ENGLISH)
  })

  it('should return current culture value', async () => {
    service.getUserSetting.mockResolvedValue({ theme: THEME_TEXT.LIGHT, culture: CULTURE_TEXT.ENGLISH })
    const useStore = createUserSettingsStore({ service })
    const store = useStore()
    await store.fetchUserSettings()

    expect(store.getCurrentCulture()).toBe(CULTURE_TEXT.ENGLISH)
  })

  it('should return current theme value', async () => {
    service.getUserSetting.mockResolvedValue({ theme: THEME_TEXT.DARK, culture: CULTURE_TEXT.VIETNAMESE })
    const useStore = createUserSettingsStore({ service })
    const store = useStore()
    await store.fetchUserSettings()

    expect(store.getCurrentTheme()).toBe(THEME_TEXT.DARK)
  })
})

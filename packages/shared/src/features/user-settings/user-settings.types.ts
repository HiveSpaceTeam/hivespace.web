export interface UserSettings {
  theme: ThemeText
  culture: CultureText
}

export type GetUserSettingResponse = UserSettings
export type SetUserSettingRequest = UserSettings

export interface IUserSettingsService {
  getUserSetting: () => Promise<GetUserSettingResponse>
  setUserSetting: (settings: SetUserSettingRequest) => Promise<void>
}

export const CULTURE_TEXT = {
  VIETNAMESE: 'vi',
  ENGLISH: 'en',
} as const

export const THEME_TEXT = {
  LIGHT: 'light',
  DARK: 'dark',
} as const

export type CultureText = (typeof CULTURE_TEXT)[keyof typeof CULTURE_TEXT]
export type ThemeText = (typeof THEME_TEXT)[keyof typeof THEME_TEXT]

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: THEME_TEXT.LIGHT,
  culture: CULTURE_TEXT.VIETNAMESE,
}

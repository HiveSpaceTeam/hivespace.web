export interface UserSettings {
  theme: number
  culture: number
}

export type GetUserSettingResponse = UserSettings
export type SetUserSettingRequest = UserSettings

export interface IUserSettingsService {
  getUserSetting: () => Promise<GetUserSettingResponse>
  setUserSetting: (settings: SetUserSettingRequest) => Promise<void>
}

export const THEME_VALUES = {
  LIGHT: 0,
  DARK: 1,
} as const

export const CULTURE_VALUES = {
  VIETNAMESE: 0,
  ENGLISH: 1,
} as const

export const CULTURE_TEXT = {
  VIETNAMESE: 'vi',
  ENGLISH: 'en',
} as const

export const THEME_TEXT = {
  LIGHT: 'light',
  DARK: 'dark',
} as const

export type ThemeValue = (typeof THEME_VALUES)[keyof typeof THEME_VALUES]
export type CultureValue = (typeof CULTURE_VALUES)[keyof typeof CULTURE_VALUES]
export type CultureText = (typeof CULTURE_TEXT)[keyof typeof CULTURE_TEXT]
export type ThemeText = (typeof THEME_TEXT)[keyof typeof THEME_TEXT]

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: THEME_VALUES.LIGHT,
  culture: CULTURE_VALUES.VIETNAMESE,
}

export const stringToNumericCulture = (cultureText: string): CultureValue => {
  switch (cultureText) {
    case CULTURE_TEXT.VIETNAMESE:
      return CULTURE_VALUES.VIETNAMESE
    case CULTURE_TEXT.ENGLISH:
      return CULTURE_VALUES.ENGLISH
    default:
      return CULTURE_VALUES.VIETNAMESE
  }
}

export const numericToStringCulture = (cultureValue: number): CultureText => {
  switch (cultureValue) {
    case CULTURE_VALUES.VIETNAMESE:
      return CULTURE_TEXT.VIETNAMESE
    case CULTURE_VALUES.ENGLISH:
      return CULTURE_TEXT.ENGLISH
    default:
      return CULTURE_TEXT.VIETNAMESE
  }
}

export const stringToNumericTheme = (themeText: string): ThemeValue => {
  switch (themeText) {
    case THEME_TEXT.LIGHT:
      return THEME_VALUES.LIGHT
    case THEME_TEXT.DARK:
      return THEME_VALUES.DARK
    default:
      return THEME_VALUES.LIGHT
  }
}

export const numericToStringTheme = (themeValue: number): ThemeText => {
  switch (themeValue) {
    case THEME_VALUES.LIGHT:
      return THEME_TEXT.LIGHT
    case THEME_VALUES.DARK:
      return THEME_TEXT.DARK
    default:
      return THEME_TEXT.LIGHT
  }
}

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { useUserSettingsStore } from './user-settings.store'
import { userSettingsService } from '@/services/user-settings.service'

jest.mock('@/services/user-settings.service', () => ({
  userSettingsService: {
    getUserSetting: jest.fn(),
    setUserSetting: jest.fn(),
  },
}))

describe('useUserSettingsStore (seller)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(userSettingsService.getUserSetting).mockResolvedValue({
      theme: 'light',
      culture: 'vi',
    })
    jest.mocked(userSettingsService.setUserSetting).mockResolvedValue(undefined)
  })

  it('should load settings from the API', async () => {
    const store = useUserSettingsStore()

    await store.fetchUserSettings()

    expect(userSettingsService.getUserSetting).toHaveBeenCalled()
    expect(store.userSettings.culture).toBe('vi')
  })

  it('should persist setting locally when updated', async () => {
    const store = useUserSettingsStore()

    await store.updateTheme('dark')

    expect(userSettingsService.setUserSetting).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'dark' }),
    )
  })
})

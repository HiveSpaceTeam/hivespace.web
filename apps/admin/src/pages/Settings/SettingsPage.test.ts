import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { createFakeAuthUser } from '@hivespace/shared/test-utils'
import { useUserSettingsStore } from '@/stores/user-settings.store'
import { userSettingsService } from '@/services/user-settings.service'

jest.mock('@/services/user-settings.service', () => ({
  userSettingsService: {
    getUserSetting: jest.fn(),
    setUserSetting: jest.fn(),
  },
}))

describe('SettingsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(userSettingsService.getUserSetting).mockResolvedValue({
      theme: 'light',
      culture: 'vi',
    })
  })

  it('should load settings without error for admin role', async () => {
    const adminUser = createFakeAuthUser({ profile: { role: ['Admin'] } })
    const store = useUserSettingsStore()

    await store.fetchUserSettings()

    expect(adminUser.isAdmin()).toBe(true)
    expect(userSettingsService.getUserSetting).toHaveBeenCalled()
    expect(store.userSettings.theme).toBe('light')
    expect(store.userSettings.culture).toBe('vi')
  })
})

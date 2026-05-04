import type { ApiRequestService, BuildApiUrl } from '../service.types'
import type {
  GetUserSettingResponse,
  IUserSettingsService,
  SetUserSettingRequest,
} from './user-settings.types'

const USER_SETTINGS_ENDPOINT = '/users/settings'

export interface UserSettingsServiceOptions {
  apiService: ApiRequestService
  buildApiUrl: BuildApiUrl
}

export const createUserSettingsService = (
  options: UserSettingsServiceOptions,
): IUserSettingsService => {
  const { apiService, buildApiUrl } = options
  const url = buildApiUrl(USER_SETTINGS_ENDPOINT)

  return {
    getUserSetting: (): Promise<GetUserSettingResponse> =>
      apiService.get<GetUserSettingResponse>(url),
    setUserSetting: (settings: SetUserSettingRequest): Promise<void> =>
      apiService.put<void>(url, settings),
  }
}

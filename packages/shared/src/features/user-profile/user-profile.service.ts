import type { ApiRequestService, BuildApiUrl } from '../service.types'
import type { GetMyProfileResponse, IUserProfileService } from './user-profile.types'

const USER_PROFILE_ENDPOINT = '/users/me'

export interface UserProfileServiceOptions {
  apiService: ApiRequestService
  buildApiUrl: BuildApiUrl
}

export const createUserProfileService = (
  options: UserProfileServiceOptions,
): IUserProfileService => {
  const { apiService, buildApiUrl } = options
  const url = buildApiUrl(USER_PROFILE_ENDPOINT)

  return {
    getMyProfile: (): Promise<GetMyProfileResponse> =>
      apiService.get<GetMyProfileResponse>(url),
  }
}

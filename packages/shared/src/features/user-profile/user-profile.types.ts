export interface MyProfile {
  userName: string
  fullName: string | null
  phoneNumber: string | null
  email: string | null
  gender: number | null
  dateOfBirth: string | null
  avatarUrl: string | null
}

export type GetMyProfileResponse = MyProfile

export interface IUserProfileService {
  getMyProfile: () => Promise<GetMyProfileResponse>
}

export type Gender = 'male' | 'female' | 'other'

// 0 = Male, 1 = Female, 2 = Other
export const GENDER_TO_API: Record<Gender | '', number> = {
  male: 0,
  female: 1,
  other: 2,
  '': 0,
}

export const GENDER_FROM_API: Record<number, Gender> = {
  0: 'male',
  1: 'female',
  2: 'other',
}

export interface UserProfileResponse {
  userName: string
  fullName: string
  phoneNumber: string
  email: string
  gender: number
  dateOfBirth: string | null
}

export interface UpdateProfileRequest {
  userName: string
  fullName: string
  phoneNumber: string
  email: string
  gender: number
  dateOfBirth: string | null
}

export interface ProfileFormData {
  name: string
  gender: Gender | ''
  birthDay: number | null
  birthMonth: number | null
  birthYear: number | null
}

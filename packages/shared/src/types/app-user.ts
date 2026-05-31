import type { SessionUser } from './auth-session'

export interface AppUserProfile {
  sub?: string
  email?: string
  name?: string
  username?: string
  preferred_username?: string
  role?: string | string[]
  email_verified?: boolean
  picture?: string
  [key: string]: unknown
}

export interface AppUser {
  id?: string
  profile: AppUserProfile
  expires_at?: number
  expiresAt?: string
  refreshExpiresAt?: string
  isSystemAdmin: () => boolean
  isAdmin: () => boolean
  isSeller: () => boolean
}

const hasRole = (role: unknown, targetRole: string): boolean => {
  if (!role) return false
  if (typeof role === 'string') return role === targetRole
  if (Array.isArray(role)) return role.flat().includes(targetRole)
  return false
}

const withRoleHelpers = <TUser extends AppUser>(user: TUser): TUser => {
  user.isSystemAdmin = () => hasRole(user.profile?.role, 'SystemAdmin')
  user.isAdmin = () => hasRole(user.profile?.role, 'Admin')
  user.isSeller = () =>
    hasRole(user.profile?.role, 'StoreOwner') || hasRole(user.profile?.role, 'Seller')

  return user
}

export const toAppUser = (user: AppUser | null): AppUser | null => {
  if (!user) return null
  return withRoleHelpers(user)
}

export const toAppUserFromSession = (
  sessionUser: SessionUser,
  expiresAt?: string,
  refreshExpiresAt?: string,
): AppUser => {
  const roles = sessionUser.roles ?? []

  const appUser: AppUser = {
    id: sessionUser.userId,
    profile: {
      sub: sessionUser.userId,
      email: sessionUser.email,
      name: sessionUser.displayName || sessionUser.email,
      username: sessionUser.displayName || sessionUser.email,
      role: roles,
      email_verified: sessionUser.emailVerified,
      picture: sessionUser.avatarUrl,
      accountStatus: sessionUser.accountStatus,
    },
    expiresAt,
    refreshExpiresAt,
    expires_at: expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) : undefined,
    isSystemAdmin: () => false,
    isAdmin: () => false,
    isSeller: () => false,
  }

  return withRoleHelpers(appUser)
}

import type { AppUser } from '../types'

export type FakeAuthRole = 'buyer' | 'seller' | 'admin'

const roleMap: Record<FakeAuthRole, string[]> = {
  buyer: ['User'],
  seller: ['Seller', 'StoreOwner'],
  admin: ['Admin'],
}

export const createFakeAuthUser = (overrides: Partial<AppUser> = {}): AppUser => {
  const roleOverride = overrides.profile?.role
  const roles = roleOverride ?? roleMap.buyer
  const user: AppUser = {
    id: 'user-001',
    profile: {
      sub: 'user-001',
      email: 'buyer@example.test',
      name: 'Test Buyer',
      username: 'test-buyer',
      preferred_username: 'test-buyer',
      role: roles,
      email_verified: true,
      ...overrides.profile,
    },
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    isSystemAdmin: () => false,
    isAdmin: () => false,
    isSeller: () => false,
    ...overrides,
  }

  user.isSystemAdmin = () => {
    const role = user.profile.role
    return Array.isArray(role) ? role.includes('SystemAdmin') : role === 'SystemAdmin'
  }
  user.isAdmin = () => {
    const role = user.profile.role
    return Array.isArray(role) ? role.includes('Admin') : role === 'Admin'
  }
  user.isSeller = () => {
    const role = user.profile.role
    return Array.isArray(role)
      ? role.includes('Seller') || role.includes('StoreOwner')
      : role === 'Seller' || role === 'StoreOwner'
  }

  return user
}

export const createFakeAuthState = (role: FakeAuthRole) => {
  const user = createFakeAuthUser({
    id: `${role}-user-001`,
    profile: {
      sub: `${role}-user-001`,
      email: `${role}@example.test`,
      name: `Test ${role}`,
      role: roleMap[role],
      storeId: role === 'seller' ? 'store-001' : undefined,
    },
  })

  return {
    user,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  }
}

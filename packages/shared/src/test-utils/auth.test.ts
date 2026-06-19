import { describe, expect, it } from '@jest/globals'
import { createFakeAuthUser, createFakeAuthState } from './auth'

describe('createFakeAuthUser', () => {
  it('should return typed user with default buyer role', () => {
    const user = createFakeAuthUser()
    expect(user.id).toBe('user-001')
    expect(user.profile.email).toBe('buyer@example.test')
    expect(typeof user.isAdmin).toBe('function')
    expect(typeof user.isSeller).toBe('function')
    expect(typeof user.isSystemAdmin).toBe('function')
  })

  it('should return true for isSeller with seller role', () => {
    const user = createFakeAuthUser({
      profile: { role: ['Seller', 'StoreOwner'] },
    })
    expect(user.isSeller()).toBe(true)
    expect(user.isAdmin()).toBe(false)
  })

  it('should return true for isAdmin with admin role', () => {
    const user = createFakeAuthUser({
      profile: { role: ['Admin'] },
    })
    expect(user.isAdmin()).toBe(true)
    expect(user.isSeller()).toBe(false)
  })

  it('should return true for isSystemAdmin with system admin role', () => {
    const user = createFakeAuthUser({
      profile: { role: ['SystemAdmin'] },
    })
    expect(user.isSystemAdmin()).toBe(true)
  })

  it('should merge overrides with defaults', () => {
    const user = createFakeAuthUser({
      id: 'custom-user-id',
      profile: { email: 'custom@example.com' },
    })
    expect(user.id).toBe('custom-user-id')
    expect(user.profile.email).toBe('custom@example.com')
  })
})

describe('createFakeAuthState', () => {
  it('should return buyer user state for buyer role', () => {
    const state = createFakeAuthState('buyer')
    expect(state.isAuthenticated).toBe(true)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.user.id).toBe('buyer-user-001')
  })

  it('should return seller user with store ID for seller role', () => {
    const state = createFakeAuthState('seller')
    expect(state.user.isSeller()).toBe(true)
    expect(state.user.profile.storeId).toBe('store-001')
  })

  it('should return admin user for admin role', () => {
    const state = createFakeAuthState('admin')
    expect(state.user.isAdmin()).toBe(true)
  })
})

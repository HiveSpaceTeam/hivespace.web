import { useAuth } from '../../composables/useAuth'
import type { AppUser } from '../../types/app-user'

type TokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  id_token?: string
}

export interface CreateRefreshServiceOptions {
  authority: string
  clientId?: string
}

export const createRefreshService = (options: CreateRefreshServiceOptions) => {
  const tokenEndpoint = new URL(
    '/connect/token',
    options.authority.replace(/\/+$/, ''),
  ).toString()

  return async (user: AppUser | null, forceRefresh = false): Promise<AppUser | null> => {
    if (!user) return null

    const now = Math.floor(Date.now() / 1000)
    const priorExpiresAt = Number(user.expires_at)
    const expiresAt = Number.isFinite(priorExpiresAt) ? priorExpiresAt : NaN

    if (!forceRefresh && Number.isFinite(expiresAt) && expiresAt - now > 60) return user

    const refreshToken = (user.refresh_token as string) || undefined
    if (!refreshToken) return null

    const body = new URLSearchParams()
    body.set('grant_type', 'refresh_token')
    body.set('refresh_token', refreshToken)
    if (options.clientId) body.set('client_id', options.clientId)

    try {
      const resp = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })

      if (!resp.ok) {
        try {
          const errBody = await resp.json()
          const err = errBody?.error_description || errBody?.error
          if (errBody?.error === 'invalid_grant' || String(err).includes('invalid_grant')) {
            return null
          }
        } catch {
          // ignore parse errors
        }
        return null
      }

      const data = (await resp.json()) as TokenResponse

      const newExpiresIn =
        typeof data.expires_in === 'number'
          ? data.expires_in
          : (user.expires_in as number | undefined)
      const newExpiresAt =
        typeof data.expires_in === 'number'
          ? Math.floor(Date.now() / 1000) + data.expires_in
          : Number.isFinite(priorExpiresAt)
            ? priorExpiresAt
            : undefined

      const newIdToken = data.id_token || user.id_token
      let newProfile = user.profile

      if (data.id_token) {
        try {
          const raw = data.id_token.split('.')[1]
          if (!raw) throw new Error('Invalid JWT structure')
          const b64 = raw.replace(/-/g, '+').replace(/_/g, '/')
          const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
          newProfile = JSON.parse(atob(padded))
        } catch (err) {
          console.error('Failed to decode new id_token', err)
        }
      }

      const updatedUser: AppUser = {
        ...user,
        access_token:
          data.access_token || (user as unknown as Record<string, string>)['access_token'],
        refresh_token:
          data.refresh_token || (user as unknown as Record<string, string>)['refresh_token'],
        id_token: newIdToken,
        profile: newProfile,
        expires_in: newExpiresIn,
        expires_at: newExpiresAt as unknown as number | undefined,
      } as AppUser

      try {
        const { storeUpdatedUser } = useAuth()
        await storeUpdatedUser(updatedUser)
      } catch (err) {
        try {
          localStorage.setItem('hivespace.refreshed_user', JSON.stringify(updatedUser))
        } catch {
          // ignore storage write failure
        }
        console.error('storeUpdatedUser failed after refresh', err)
      }

      return updatedUser
    } catch {
      return null
    }
  }
}

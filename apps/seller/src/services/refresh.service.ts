import { config } from '@/config'
import type { AppUser } from '@hivespace/shared'
import { useAuth } from '@hivespace/shared'

type TokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  id_token?: string
}

const tokenEndpoint = new URL(
  '/connect/token',
  config.auth.oidc.authority.replace(/\/+$/, ''),
).toString()

// Helper: perform a refresh_token exchange using the stored refresh token
export async function refreshToken(
  user: AppUser | null,
  forceRefresh = false,
): Promise<AppUser | null> {
  if (!user) return null

  const now = Math.floor(Date.now() / 1000)

  // Treat stored expires_at as the authoritative expiry when present.
  // Coerce to number and treat missing/non-numeric values as expired so we
  // attempt a refresh immediately.
  const priorExpiresAt = Number(user.expires_at)
  const expiresAt = Number.isFinite(priorExpiresAt) ? priorExpiresAt : NaN

  // If token is valid for at least 60 more seconds and forceRefresh is false, no action
  if (!forceRefresh && Number.isFinite(expiresAt) && expiresAt - now > 60) return user

  const refreshToken = (user.refresh_token as string) || undefined
  if (!refreshToken) return null

  const body = new URLSearchParams()
  body.set('grant_type', 'refresh_token')
  body.set('refresh_token', refreshToken)
  if (config.auth.oidc.clientId) body.set('client_id', config.auth.oidc.clientId)

  try {
    const resp = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!resp.ok) {
      // Try to parse error details. If the server returns invalid_grant, caller should
      // treat this as a sign to fully re-authenticate (logout then login).
      try {
        const errBody = await resp.json()
        const err = errBody?.error_description || errBody?.error
        if (errBody?.error === 'invalid_grant' || String(err).includes('invalid_grant')) {
          // Signal to caller by returning null. Caller can call logout() when appropriate.
          return null
        }
      } catch {
        // ignore parse errors
      }

      return null
    }

    const data = (await resp.json()) as TokenResponse

    // Build the updated user. Only set a new expires_at when the server
    // returned a fresh expires_in value. Otherwise carry forward the prior
    // numeric expires_at (if any) and do not recompute it from previously
    // persisted expires_in which would incorrectly extend lifetime.
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

    // If we got a new id_token, decode it to get the new profile
    if (data.id_token) {
      try {
        const payload = JSON.parse(atob(data.id_token.split('.')[1]))
        newProfile = payload
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
      // expires_at may be undefined when there's no authoritative expiry
      expires_at: newExpiresAt as unknown as number | undefined,
    } as AppUser

    try {
      // Persist refreshed token info into the user store used by oidc-client-ts so
      // userManager.getUser() returns the rotated tokens for the rest of the app.
      const { storeUpdatedUser } = useAuth()
      await storeUpdatedUser(updatedUser)
    } catch (err) {
      // If that fails, fall back to an app-local storage key so the API client can still use it.
      try {
        localStorage.setItem('hivespace.refreshed_user', JSON.stringify(updatedUser))
      } catch {
        // ignore storage write failure
      }
      // And log the failure for diagnostics
      console.error('storeUpdatedUser failed after refresh', err)
    }

    return updatedUser
  } catch {
    return null
  }
}

export default refreshToken

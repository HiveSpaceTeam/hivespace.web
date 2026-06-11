import type { GoogleAuthApp } from '../types'

const storageKey = (app: GoogleAuthApp): string => `hivespace.pendingVerificationEmail.${app}`

const canUseStorage = (): boolean => typeof window !== 'undefined' && !!window.sessionStorage

export const getPendingVerificationEmail = (app: GoogleAuthApp): string => {
  if (!canUseStorage()) return ''

  return window.sessionStorage.getItem(storageKey(app))?.trim() ?? ''
}

export const setPendingVerificationEmail = (app: GoogleAuthApp, email: string): void => {
  if (!canUseStorage()) return

  const value = email.trim()

  if (!value) {
    window.sessionStorage.removeItem(storageKey(app))
    return
  }

  window.sessionStorage.setItem(storageKey(app), value)
}

export const clearPendingVerificationEmail = (app: GoogleAuthApp): void => {
  if (!canUseStorage()) return

  window.sessionStorage.removeItem(storageKey(app))
}

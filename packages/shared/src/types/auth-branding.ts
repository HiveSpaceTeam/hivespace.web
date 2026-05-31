import type { AuthApp } from './auth-session'

export interface AuthBranding {
  imageSrc: string
  altKey: string
  headingKey: string
  bodyKey: string
  app: AuthApp
}

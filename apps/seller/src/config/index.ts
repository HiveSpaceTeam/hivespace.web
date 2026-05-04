/**
 * Main configuration file for HiveSpace Seller Center
 * Centralized configuration for API endpoints, authentication, and application settings
 */
import {
  type AuthConfig,
  type Environment,
  validateUrl,
  validateEnvironment,
  parseBoolean,
  parseNumber,
  joinUrl,
} from '@hivespace/shared'

const getEnvVar = (key: string, defaultValue?: string): string => {
  return import.meta.env[key] || defaultValue || ''
}

// Type definitions for better TypeScript support
export interface AppConfig {
  readonly app: {
    readonly name: string
    readonly version: string
    readonly environment: Environment
  }
  readonly api: {
    readonly baseUrl: string
    readonly timeout: number
    readonly version: string
  }
  readonly auth: {
    readonly oidc: AuthConfig
    readonly callbackUrl: string
  }
  readonly features: {
    readonly enableLogging: boolean
    readonly enableAnalytics: boolean
    readonly enableDebug: boolean
  }
  readonly services: {
    readonly storageBaseUrl: string
    readonly cdnBaseUrl: string
  }
}

// Main configuration object with validation and caching
let configCache: AppConfig | null = null

const createConfig = (): AppConfig => {
  // Base API URL with validation
  const apiBaseUrl = validateUrl(
    getEnvVar('VITE_GATEWAY_BASE_URL') ||
    getEnvVar('VITE_API_BASE_URL') ||
    getEnvVar('VITE_API_URL') ||
    'https://localhost:7001/api',
    'API Base URL',
  )

  return {
    // Application settings
    app: {
      name: getEnvVar('VITE_APP_NAME', 'HiveSpace Seller Center'),
      version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
      environment: validateEnvironment(
        getEnvVar('VITE_APP_ENVIRONMENT') || getEnvVar('VITE_APP_ENV', 'development'),
      ),
    },

    // API Configuration
    api: {
      baseUrl: apiBaseUrl,
      timeout: parseNumber(getEnvVar('VITE_API_TIMEOUT'), 30000),
      version: getEnvVar('VITE_API_VERSION', 'v1'),
    },

    // Authentication Configuration
    auth: {
      oidc: {
        clientId: getEnvVar('VITE_APP_CLIENT_ID'),
        redirectUri: validateUrl(
          getEnvVar('VITE_APP_REDIRECT_URI', 'http://localhost:5174/callback/login'),
          'Redirect URI',
        ),
        postLogoutRedirectUri: validateUrl(
          getEnvVar('VITE_APP_POST_LOGOUT_REDIRECT_URI', 'http://localhost:5174/callback/logout'),
          'Post Logout Redirect URI',
        ),
        responseType: getEnvVar('VITE_APP_RESPONSE_TYPE', 'code'),
        responseMode: getEnvVar('VITE_APP_RESPONSE_MODE', 'query') as
          | 'query'
          | 'fragment'
          | undefined,
        // Request refresh tokens for the SPA using offline_access
        scope: getEnvVar('VITE_APP_SCOPE', 'openid profile email offline_access'),
        authority: validateUrl(
          getEnvVar('VITE_AUTH_AUTHORITY_URL') ||
          getEnvVar('VITE_IDENTITY_SERVER_URL') ||
          `${apiBaseUrl}/identity`,
          'Authority URL',
        ),
        // Use localStorage so the session persists across tabs (e.g. email verification links
        // opened in a new tab can still reach the user session via getCurrentUser())
        storageType: 'local' as const,
      },
      callbackUrl: validateUrl(
        getEnvVar('VITE_AUTH_CALLBACK_URL', 'http://localhost:5174/auth/callback'),
        'Auth Callback URL',
      ),
    },

    // Feature Flags
    features: {
      enableLogging: parseBoolean(getEnvVar('VITE_ENABLE_LOGGING'), false),
      enableAnalytics: parseBoolean(getEnvVar('VITE_ENABLE_ANALYTICS'), false),
      enableDebug:
        parseBoolean(getEnvVar('VITE_ENABLE_DEBUG'), false) ||
        import.meta.env.NODE_ENV === 'development',
    },

    // External Services
    services: {
      storageBaseUrl: validateUrl(
        getEnvVar('VITE_STORAGE_BASE_URL', 'https://storage.hivespace.com'),
        'Storage Base URL',
      ),
      cdnBaseUrl: validateUrl(
        getEnvVar('VITE_CDN_BASE_URL', 'https://cdn.hivespace.com'),
        'CDN Base URL',
      ),
    },
  } as const
}

// Export cached configuration
export const config: AppConfig = configCache || (configCache = createConfig())

// Environment helper functions
export const isDevelopment = (): boolean => config.app.environment === 'development'
export const isProduction = (): boolean => config.app.environment === 'production'
export const isStaging = (): boolean => config.app.environment === 'staging'

/**
 * Build API URL through the API gateway
 * @param path - API endpoint path
 * @param version - Optional API version override
 * @returns Complete API URL through gateway
 */
export const buildApiUrl = (path: string, version?: string): string => {
  const apiVersion = version || config.api.version
  const versionedPath = path.startsWith('/') ? `/${apiVersion}${path}` : `/${apiVersion}/${path}`
  const base = config.api.baseUrl.replace(/\/+$/, '')
  const apiRoot = base.endsWith('/api') ? base : `${base}/api`
  return joinUrl(apiRoot, versionedPath)
}

/**
 * Get complete asset URL from CDN or storage
 * @param path - Asset path
 * @param useStorage - Whether to use storage service instead of CDN
 * @returns Complete asset URL
 */
export const getAssetUrl = (path: string, useStorage = false): string => {
  const baseUrl = useStorage ? config.services.storageBaseUrl : config.services.cdnBaseUrl
  return joinUrl(baseUrl, path)
}

// Export individual config sections for convenience
export const { app, api, auth, features, services } = config

// Default export for compatibility
export default config

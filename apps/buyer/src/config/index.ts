/**
 * Main configuration file for HiveSpace Storefront
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

let configCache: AppConfig | null = null

const createConfig = (): AppConfig => {
    const apiBaseUrl = validateUrl(
        getEnvVar('VITE_GATEWAY_BASE_URL') ||
        getEnvVar('VITE_API_BASE_URL') ||
        getEnvVar('VITE_API_URL') ||
        'https://localhost:7001/api',
        'API Base URL',
    )

    return {
        app: {
            name: getEnvVar('VITE_APP_NAME', 'HiveSpace Storefront'),
            version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
            environment: validateEnvironment(
                getEnvVar('VITE_APP_ENVIRONMENT') || getEnvVar('VITE_APP_ENV', 'development'),
            ),
        },

        api: {
            baseUrl: apiBaseUrl,
            timeout: parseNumber(getEnvVar('VITE_API_TIMEOUT'), 30000),
            version: getEnvVar('VITE_API_VERSION', 'v1'),
        },

        auth: {
            oidc: {
                clientId: getEnvVar('VITE_APP_CLIENT_ID'),
                redirectUri: validateUrl(
                    getEnvVar('VITE_APP_REDIRECT_URI', 'http://localhost:5175/callback/login'),
                    'Redirect URI',
                ),
                postLogoutRedirectUri: validateUrl(
                    getEnvVar('VITE_APP_POST_LOGOUT_REDIRECT_URI', 'http://localhost:5175/callback/logout'),
                    'Post Logout Redirect URI',
                ),
                responseType: getEnvVar('VITE_APP_RESPONSE_TYPE', 'code'),
                responseMode: getEnvVar('VITE_APP_RESPONSE_MODE', 'query') as
                    | 'query'
                    | 'fragment'
                    | undefined,
                scope: getEnvVar('VITE_APP_SCOPE', 'openid profile email'),
                authority: validateUrl(
                    getEnvVar('VITE_AUTH_AUTHORITY_URL') ||
                    getEnvVar('VITE_IDENTITY_SERVER_URL') ||
                    'http://localhost:5001',
                    'Authority URL',
                ),
                storageType: 'local' as const,
            },
            callbackUrl: validateUrl(
                getEnvVar('VITE_AUTH_CALLBACK_URL', 'http://localhost:5175/auth/callback'),
                'Auth Callback URL',
            ),
        },

        features: {
            enableLogging: parseBoolean(getEnvVar('VITE_ENABLE_LOGGING'), false),
            enableAnalytics: parseBoolean(getEnvVar('VITE_ENABLE_ANALYTICS'), false),
            enableDebug:
                parseBoolean(getEnvVar('VITE_ENABLE_DEBUG'), false) ||
                import.meta.env.NODE_ENV === 'development',
        },

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

export const config: AppConfig = configCache || (configCache = createConfig())

export const buildApiUrl = (path: string, version?: string): string => {
    const apiVersion = version || config.api.version
    const versionedPath = path.startsWith('/') ? `/${apiVersion}${path}` : `/${apiVersion}/${path}`
    const base = config.api.baseUrl.replace(/\/+$/, '')
    const apiRoot = base.endsWith('/api') ? base : `${base}/api`
    return joinUrl(apiRoot, versionedPath)
}

export default config

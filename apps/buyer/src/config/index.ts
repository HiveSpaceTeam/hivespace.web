/**
 * Main configuration file for HiveSpace Storefront
 */
import {
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
        readonly app: 'buyer'
        readonly gatewayBaseUrl: string
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
    const gatewayBaseUrl = validateUrl(
        getEnvVar('VITE_GATEWAY_BASE_URL') ||
        getEnvVar('VITE_API_BASE_URL') ||
        getEnvVar('VITE_API_URL') ||
        'https://localhost:7001',
        'Gateway Base URL',
    )
    const apiBaseUrl = gatewayBaseUrl.replace(/\/api(\/.*)?$/, '')

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
            app: 'buyer',
            gatewayBaseUrl: apiBaseUrl,
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

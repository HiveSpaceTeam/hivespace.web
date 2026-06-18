import { joinUrl } from '@hivespace/shared'

const config = {
  app: {
    name: 'HiveSpace Storefront',
    version: '1.0.0',
    environment: 'test',
  },
  api: {
    baseUrl: 'http://localhost:5000',
    timeout: 30000,
    version: 'v1',
  },
  auth: {
    app: 'buyer',
    gatewayBaseUrl: 'http://localhost:5000',
  },
  features: {
    enableLogging: false,
    enableAnalytics: false,
    enableDebug: false,
  },
  services: {
    storageBaseUrl: 'https://storage.hivespace.test',
    cdnBaseUrl: 'https://cdn.hivespace.test',
  },
} as const

export const buildApiUrl = (path: string, version?: string): string => {
  const apiVersion = version || config.api.version
  const versionedPath = path.startsWith('/') ? `/${apiVersion}${path}` : `/${apiVersion}/${path}`
  return joinUrl(`${config.api.baseUrl}/api`, versionedPath)
}

export { config }
export const { app, api, auth, features, services } = config
export default config

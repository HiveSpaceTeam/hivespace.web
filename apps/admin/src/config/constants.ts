/**
 * Environment-specific constants and validation
 * This file contains environment validation and constants that don't change
 */

import { config } from './index'

// Validate required environment variables
const requiredEnvVars = ['VITE_APP_CLIENT_ID', 'VITE_API_BASE_URL'] as const

// Check for missing required environment variables
export const validateEnvironment = (): void => {
  const missing = requiredEnvVars.filter((envVar) => !import.meta.env[envVar])

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing)
    if (config.app.environment === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
  }
}

// Environment-specific constants
export const ENVIRONMENT_CONSTANTS = {
  development: {
    apiTimeout: 60000, // Longer timeout for development
    enableMockData: true,
    logLevel: 'debug',
  },
  staging: {
    apiTimeout: 30000,
    enableMockData: false,
    logLevel: 'info',
  },
  production: {
    apiTimeout: 15000, // Shorter timeout for production
    enableMockData: false,
    logLevel: 'error',
  },
} as const

// Get current environment constants
export const getCurrentEnvironmentConstants = () => {
  return ENVIRONMENT_CONSTANTS[config.app.environment]
}

// App metadata
export const APP_METADATA = {
  title: config.app.name,
  description: 'HiveSpace Admin Portal - Manage your HiveSpace platform',
  keywords: 'hivespace, admin, portal, management',
  author: 'HiveSpace Team',
  version: config.app.version,
} as const

// API configuration constants
export const API_CONSTANTS = {
  defaultPageSize: 20,
  maxPageSize: 100,
  defaultTimeout: config.api.timeout,
  retryAttempts: 3,
  retryDelay: 1000,
} as const

// Auth configuration constants
export const AUTH_CONSTANTS = {
  tokenStorageKey: 'hivespace_admin_token',
  refreshTokenStorageKey: 'hivespace_admin_refresh_token',
  userStorageKey: 'hivespace_admin_user',
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  refreshTokenTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const

// Feature flag constants
export const FEATURE_FLAGS = {
  ...config.features,
  // Add computed feature flags based on environment
  enableHotReload: config.app.environment === 'development',
  enableSourceMaps: config.app.environment !== 'production',
  enableErrorReporting: config.app.environment === 'production',
} as const

// Cache configuration
export const CACHE_CONSTANTS = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  longTTL: 30 * 60 * 1000, // 30 minutes
  shortTTL: 1 * 60 * 1000, // 1 minute
} as const

// Initialize environment validation
if (config.app.environment === 'production') {
  validateEnvironment()
}

export default {
  validateEnvironment,
  getCurrentEnvironmentConstants,
  APP_METADATA,
  API_CONSTANTS,
  AUTH_CONSTANTS,
  FEATURE_FLAGS,
  CACHE_CONSTANTS,
}

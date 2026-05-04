import type { RegisterStoreRequest, RegisterStoreResponse } from '@/types'
import { apiService } from './api'
import { buildApiUrl } from '@/config'

// Store API endpoints (without version prefix since buildApiUrl handles versioning)
const STORE_ENDPOINTS = {
  STORE: '/stores',
} as const

// Store service class
class StoreService {
  /**
   * Register a new store
   */
  async registerStore(storeData: RegisterStoreRequest): Promise<RegisterStoreResponse> {
    const url = buildApiUrl(STORE_ENDPOINTS.STORE)
    return await apiService.post<RegisterStoreResponse>(url, storeData)
  }
}

// Create and export the store service instance
export const storeService = new StoreService()

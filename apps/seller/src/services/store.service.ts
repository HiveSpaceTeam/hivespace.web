import type { RegisterStoreRequest, RegisterStoreResponse } from '@/types'
import { BaseService } from './base.service'

class StoreService extends BaseService {
  async registerStore(storeData: RegisterStoreRequest): Promise<RegisterStoreResponse> {
    return this.post<RegisterStoreResponse>('/stores', storeData)
  }
}

export const storeService = new StoreService()

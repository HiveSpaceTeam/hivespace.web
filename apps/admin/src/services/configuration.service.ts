import type {
  GetPlatformCurrencyConfigResponse,
  UpdatePlatformCurrencyConfigRequest,
  UpdatePlatformCurrencyConfigResponse,
} from '@/types'
import { BaseService } from './base.service'

class ConfigurationService extends BaseService {
  async getCurrencyConfig(): Promise<GetPlatformCurrencyConfigResponse> {
    return this.get<GetPlatformCurrencyConfigResponse>('/admins/configuration/currencies')
  }

  async updateCurrencyConfig(
    payload: UpdatePlatformCurrencyConfigRequest,
  ): Promise<UpdatePlatformCurrencyConfigResponse> {
    return this.put<UpdatePlatformCurrencyConfigResponse>(
      '/admins/configuration/currencies',
      payload,
    )
  }
}

export const configurationService = new ConfigurationService()

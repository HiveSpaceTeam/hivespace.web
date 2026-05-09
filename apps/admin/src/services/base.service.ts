import { BaseService as SharedBaseService } from '@hivespace/shared'
import { apiService } from './api'
import { buildApiUrl } from '@/config'

export class BaseService extends SharedBaseService {
  constructor() {
    super(apiService, buildApiUrl)
  }
}

import type { AxiosRequestConfig } from 'axios'
import type { ApiService } from './api'

export class BaseService {
  constructor(
    private readonly api: ApiService,
    private readonly buildUrl: (path: string) => string,
  ) {}

  protected get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.get<T>(this.buildUrl(path), config)
  }

  protected post<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.api.post<T>(this.buildUrl(path), data, config)
  }

  protected put<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.api.put<T>(this.buildUrl(path), data, config)
  }

  protected delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.delete<T>(this.buildUrl(path), config)
  }
}

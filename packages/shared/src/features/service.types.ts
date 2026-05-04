import type { AxiosRequestConfig } from 'axios'

export interface ApiRequestService {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
}

export type BuildApiUrl = (path: string, version?: string) => string

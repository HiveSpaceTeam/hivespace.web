import axios, {
  type AxiosAdapter,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

type StubbedResponse = {
  data: unknown
  status: number
}

const responseQueues = new WeakMap<AxiosInstance, Map<string, StubbedResponse[]>>()

const toKey = (method: string | undefined, path: string | undefined) =>
  `${(method ?? 'get').toLowerCase()} ${path ?? ''}`

const createResponse = (
  config: InternalAxiosRequestConfig,
  data: unknown,
  status: number,
): AxiosResponse => ({
  data,
  status,
  statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
  headers: {},
  config,
})

export const createMockAxios = (): AxiosInstance => {
  const instance = axios.create({ baseURL: 'http://localhost.test' })
  const queues = new Map<string, StubbedResponse[]>()
  responseQueues.set(instance, queues)

  const adapter: AxiosAdapter = async config => {
    const key = toKey(config.method, config.url)
    const queue = queues.get(key)
    const next = queue?.shift()
    return createResponse(
      config as InternalAxiosRequestConfig,
      next?.data,
      next?.status ?? 200,
    )
  }

  instance.defaults.adapter = adapter
  return instance
}

export const stubApiResponse = (
  instance: AxiosInstance,
  method: string,
  path: string,
  data: unknown,
  status = 200,
): void => {
  const queues = responseQueues.get(instance)
  if (!queues) {
    throw new Error('stubApiResponse requires an instance from createMockAxios')
  }

  const key = toKey(method, path)
  const queue = queues.get(key) ?? []
  queue.push({ data, status })
  queues.set(key, queue)
}

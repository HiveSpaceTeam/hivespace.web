import { describe, expect, it } from '@jest/globals'
import { createMockAxios, stubApiResponse } from './api'

describe('createMockAxios', () => {
  it('should return stubbed data when method and path match', async () => {
    const api = createMockAxios()
    stubApiResponse(api, 'get', '/health', { ok: true })

    const response = await api.get('/health')

    expect(response.data).toEqual({ ok: true })
  })
})

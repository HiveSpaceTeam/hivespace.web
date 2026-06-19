import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { useStoreStore } from './store.store'
import { storeService } from '@/services/store.service'

jest.mock('@/services/store.service', () => ({
  storeService: {
    registerStore: jest.fn(),
  },
}))

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    useAuth: () => ({
      refreshSession: jest.fn().mockImplementation(() => Promise.resolve()),
    }),
  }
})

describe('useStoreStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(storeService.registerStore).mockResolvedValue({
      storeId: 'store-001',
      storeName: 'My Store',
      storeDescription: null,
      storeLogo: '',
      storeAddress: '',
    })
  })

  it('should load store profile from the API', async () => {
    const store = useStoreStore()

    const result = await store.registerStore({
      storeName: 'My Store',
      storeLogoFileId: '',
      address: '123 Test St',
    })

    expect(storeService.registerStore).toHaveBeenCalled()
    expect(result?.storeName).toBe('My Store')
    expect(store.currentStore?.storeId).toBe('store-001')
  })

  it('should call endpoint when updating store', async () => {
    const store = useStoreStore()

    await store.registerStore({ storeName: 'Updated Store', storeLogoFileId: '', address: '' })

    expect(storeService.registerStore).toHaveBeenCalledWith(
      expect.objectContaining({ storeName: 'Updated Store' }),
    )
  })
})

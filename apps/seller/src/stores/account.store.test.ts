import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { useAccountStore } from './account.store'
import { accountService } from '@/services/account.service'

jest.mock('@/services/account.service', () => ({
  accountService: {
    resendVerificationEmail: jest.fn(),
    verifyEmail: jest.fn(),
  },
}))

describe('useAccountStore (seller)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(accountService.resendVerificationEmail).mockResolvedValue(undefined)
    jest.mocked(accountService.verifyEmail).mockResolvedValue(undefined)
  })

  it('should load account profile from the API', async () => {
    const store = useAccountStore()

    await store.resendVerificationEmail({ email: 'seller@example.test', app: 'seller' })

    expect(accountService.resendVerificationEmail).toHaveBeenCalledWith({
      email: 'seller@example.test',
      app: 'seller',
    })
    expect(store.isSendingVerification).toBe(false)
  })
})

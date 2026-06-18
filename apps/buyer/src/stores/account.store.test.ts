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

describe('useAccountStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(accountService.resendVerificationEmail).mockResolvedValue(undefined)
    jest.mocked(accountService.verifyEmail).mockResolvedValue(undefined)
  })

  it('should resend verification email via service', async () => {
    const store = useAccountStore()

    await store.resendVerificationEmail({ email: 'buyer@example.test', app: 'buyer' })

    expect(accountService.resendVerificationEmail).toHaveBeenCalledWith({
      email: 'buyer@example.test',
      app: 'buyer',
    })
  })

  it('should call verify email endpoint with token', async () => {
    const store = useAccountStore()

    await store.verifyEmail('user-001', 'token-abc')

    expect(accountService.verifyEmail).toHaveBeenCalledWith({
      userId: 'user-001',
      token: 'token-abc',
    })
  })
})

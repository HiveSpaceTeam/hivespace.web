import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { render, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import VerifyEmailCallbackPage from './VerifyEmailCallbackPage.vue'
import { accountService } from '@/services/account.service'

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    AuthLayout: { template: '<div data-testid="auth-layout"><slot /></div>' },
    Spinner: { template: '<div data-testid="spinner" />' },
    clearPendingVerificationEmail: jest.fn(),
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifySuccess: jest.fn(),
      notifyError: jest.fn(),
    }),
  }
})

jest.mock('@/services/account.service', () => ({
  accountService: {
    resendVerificationEmail: jest.fn(),
    verifyEmail: jest.fn(),
  },
}))

const renderCallback = async (url: string) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/verify-email-callback', component: VerifyEmailCallbackPage, meta: { allowAnonymous: true } },
      { path: '/signin', component: { template: '<div />' } },
      { path: '/verify-email', component: { template: '<div />' } },
    ],
  })
  await router.push(url)
  await router.isReady()

  return render(VerifyEmailCallbackPage, { global: { plugins: [pinia, router, i18n] } })
}

describe('VerifyEmailCallbackPage (seller)', () => {
  beforeEach(() => {
    jest.mocked(accountService.verifyEmail).mockResolvedValue(undefined)
  })

  it('onMount_CallsVerifyEndpoint', async () => {
    await renderCallback('/verify-email-callback?userId=user-001&token=token-abc')

    await waitFor(() => {
      expect(accountService.verifyEmail).toHaveBeenCalledWith({
        userId: 'user-001',
        token: 'token-abc',
      })
    })
  })
})

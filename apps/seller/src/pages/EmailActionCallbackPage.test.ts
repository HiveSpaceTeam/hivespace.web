import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import EmailActionCallbackPage from './EmailActionCallbackPage.vue'
import { accountService } from '@/services/account.service'

const mockNotifySuccess = jest.fn()
const mockNotifyError = jest.fn()
const mockClearPendingVerificationEmail = jest.fn()

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')

  return {
    ...actual,
    AppHeader: { template: '<header data-testid="app-header" />' },
    Button: {
      emits: ['click'],
      template: '<button @click="$emit(\'click\')"><slot /></button>',
    },
    CheckLargeIcon: { template: '<span />' },
    ErrorIcon: { template: '<span />' },
    LoadingSpinnerIcon: { template: '<span />' },
    MailIcon: { template: '<span />' },
    clearPendingVerificationEmail: (...args: unknown[]) => mockClearPendingVerificationEmail(...args),
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifySuccess: mockNotifySuccess,
      notifyError: mockNotifyError,
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
      {
        path: '/email-action-callback',
        component: EmailActionCallbackPage,
        meta: { allowAnonymous: true },
      },
      { path: '/signin', component: { template: '<div>signin</div>' } },
      { path: '/verify-email', component: { template: '<div>verify-email</div>' } },
    ],
  })

  await router.push(url)
  await router.isReady()

  render(EmailActionCallbackPage, { global: { plugins: [pinia, router, i18n] } })

  return { router }
}

describe('EmailActionCallbackPage (seller)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(accountService.verifyEmail).mockResolvedValue(undefined)
  })

  it('verifies email successfully and clears pending email state', async () => {
    await renderCallback('/email-action-callback?userId=user-001&token=tok-abc')

    await waitFor(() => {
      expect(accountService.verifyEmail).toHaveBeenCalledWith({
        userId: 'user-001',
        token: 'tok-abc',
      })
    })

    await waitFor(() => {
      expect(mockClearPendingVerificationEmail).toHaveBeenCalledWith('seller')
    })
    expect(mockNotifySuccess).toHaveBeenCalledWith(
      i18n.global.t('verifyEmailCallback.success.title'),
      i18n.global.t('verifyEmailCallback.success.subtitle'),
    )
    expect(screen.getByText(i18n.global.t('verifyEmailCallback.success.title'))).toBeTruthy()
  })

  it('shows missing token state when required query params are absent', async () => {
    await renderCallback('/email-action-callback?userId=user-001')

    expect(accountService.verifyEmail).not.toHaveBeenCalled()
    expect(screen.getByText(i18n.global.t('verifyEmailCallback.error.noToken'))).toBeTruthy()
  })

  it('maps translated backend verification errors', async () => {
    jest.mocked(accountService.verifyEmail).mockRejectedValue({
      errors: [{ messageCode: 'AlreadyVerified' }],
    })

    await renderCallback('/email-action-callback?userId=user-001&token=bad-token')

    await waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalledWith(
        i18n.global.t('verifyEmailCallback.error.title'),
        i18n.global.t('verifyEmailCallback.errors.AlreadyVerified'),
      )
    })

    expect(screen.getByText(i18n.global.t('verifyEmailCallback.errors.AlreadyVerified'))).toBeTruthy()
  })

  it('falls back to the generic verification error when backend code is unknown', async () => {
    jest.mocked(accountService.verifyEmail).mockRejectedValue({
      errors: [{ code: 'UnknownFailure' }],
    })

    await renderCallback('/email-action-callback?userId=user-001&token=bad-token')

    await waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalledWith(
        i18n.global.t('verifyEmailCallback.error.title'),
        i18n.global.t('verifyEmailCallback.errors.generalError'),
      )
    })

    expect(screen.getByText(i18n.global.t('verifyEmailCallback.errors.generalError'))).toBeTruthy()
  })

  it('goes to sign in and preserves returnUrl from the success state', async () => {
    const { router } = await renderCallback(
      '/email-action-callback?userId=user-001&token=tok-abc&returnUrl=%2Fcheckout',
    )

    await fireEvent.click(
      await screen.findByRole('button', { name: i18n.global.t('verifyEmailCallback.actions.goToLogin') }),
    )

    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/signin')
    })
    expect(router.currentRoute.value.query).toEqual({ returnUrl: '/checkout' })
  })

  it('goes to verify email and preserves returnUrl in the recovery flow', async () => {
    jest.mocked(accountService.verifyEmail).mockRejectedValue(new Error('broken'))
    const { router } = await renderCallback(
      '/email-action-callback?userId=user-001&token=bad-token&returnUrl=%2Fcheckout',
    )

    await fireEvent.click(
      await screen.findByRole('button', { name: i18n.global.t('verifyEmailCallback.error.sendNewEmail') }),
    )

    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/verify-email')
    })
    expect(router.currentRoute.value.query).toEqual({
      returnUrl: '/checkout',
      outcome: 'verificationRecovery',
    })
  })

  it('renders the shared header shell', async () => {
    await renderCallback('/email-action-callback?userId=user-001&token=tok-abc')

    expect(screen.getByTestId('app-header')).toBeTruthy()
  })
})

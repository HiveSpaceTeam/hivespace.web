import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import VerifyEmailCallbackPage from './VerifyEmailCallbackPage.vue'
import { accountService } from '@/services/account.service'

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    AuthLayout: { template: '<div><slot /></div>' },
    Button: { template: '<button><slot /></button>' },
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

  return { router, result: render(VerifyEmailCallbackPage, { global: { plugins: [pinia, router, i18n] } }) }
}

describe('VerifyEmailCallbackPage (buyer)', () => {
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

  it('onSuccess_NavigatesToHome', async () => {
    await renderCallback('/verify-email-callback?userId=user-001&token=token-abc')

    await waitFor(() => {
      expect(screen.queryByText(i18n.global.t('verifyEmailCallback.success.title'))).toBeTruthy()
    })
  })

  it('onMounted_WhenTokenMissing_SetsErrorState', async () => {
    await renderCallback('/verify-email-callback?userId=user-001')

    await waitFor(() => {
      expect(screen.queryByText(i18n.global.t('verifyEmailCallback.error.title'))).toBeTruthy()
    })
    expect(accountService.verifyEmail).not.toHaveBeenCalled()
  })

  it('onMounted_WhenUserIdMissing_SetsErrorState', async () => {
    await renderCallback('/verify-email-callback?token=token-abc')

    await waitFor(() => {
      expect(screen.queryByText(i18n.global.t('verifyEmailCallback.error.title'))).toBeTruthy()
    })
    expect(accountService.verifyEmail).not.toHaveBeenCalled()
  })

  it('onMounted_WhenVerifyFails_SetsErrorState', async () => {
    jest.mocked(accountService.verifyEmail).mockRejectedValueOnce({
      errors: [{ messageCode: 'invalidToken' }],
    })

    await renderCallback('/verify-email-callback?userId=user-001&token=bad-token')

    await waitFor(() => {
      expect(screen.queryByText(i18n.global.t('verifyEmailCallback.error.title'))).toBeTruthy()
    })
  })

  it('renders_ErrorState_WithRetryButtons', async () => {
    await renderCallback('/verify-email-callback?userId=user-001')

    await waitFor(() => {
      expect(
        screen.queryByText(i18n.global.t('verifyEmailCallback.actions.requestNewVerification')),
      ).toBeTruthy()
      expect(
        screen.queryByText(i18n.global.t('verifyEmailCallback.actions.goToSignIn')),
      ).toBeTruthy()
    })
  })

  it('goToSignIn_WhenClicked_NavigatesToSignIn', async () => {
    const { router } = await renderCallback('/verify-email-callback?userId=user-001')

    const signInBtn = await screen.findByText(
      i18n.global.t('verifyEmailCallback.actions.goToSignIn'),
    )
    fireEvent.click(signInBtn)

    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/signin')
    })
  })

  it('goToVerifyEmail_WhenClicked_NavigatesToVerifyEmail', async () => {
    const { router } = await renderCallback('/verify-email-callback?userId=user-001')

    const resendBtn = await screen.findByText(
      i18n.global.t('verifyEmailCallback.actions.requestNewVerification'),
    )
    fireEvent.click(resendBtn)

    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/verify-email')
    })
  })
})

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import OtpCodeEntryPage from './OtpCodeEntryPage.vue'
import { useOtpAuthStore } from '@/stores/otp-auth.store'

const mockNotifyError = jest.fn()
const mockNotifySuccess = jest.fn()

jest.mock('@hivespace/shared', () => {
  const actual =
    jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')

  return {
    ...actual,
    AuthLayout: { template: '<div data-testid="auth-layout"><slot /></div>' },
    Button: {
      props: ['type', 'loading', 'disabled'],
      template:
        '<button :type="type || \'button\'" :disabled="disabled || loading"><slot /></button>',
    },
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifyError: mockNotifyError,
      notifySuccess: mockNotifySuccess,
    }),
  }
})

jest.mock('@/config', () => ({
  config: {
    auth: {
      app: 'buyer',
      gatewayBaseUrl: 'http://localhost:5000',
    },
  },
}))

const mountPage = async ({
  initialPath = '/auth/otp/code?returnUrl=%2Fcheckout',
  seed,
}: {
  initialPath?: string
  seed?: (store: ReturnType<typeof useOtpAuthStore>) => void
} = {}) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useOtpAuthStore()
  seed?.(store)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/auth/otp', component: { template: '<div>otp-request</div>' }, meta: { allowAnonymous: true } },
      { path: '/auth/otp/code', component: OtpCodeEntryPage, meta: { allowAnonymous: true } },
      { path: '/signin', component: { template: '<div>signin</div>' }, meta: { allowAnonymous: true } },
      { path: '/', component: { template: '<div>home</div>' }, meta: { allowAnonymous: true } },
      { path: '/checkout', component: { template: '<div>checkout</div>' }, meta: { allowAnonymous: true } },
      { path: '/orders', component: { template: '<div>orders</div>' }, meta: { allowAnonymous: true } },
    ],
  })

  router.beforeEach((to) => {
    if (to.path === '/auth/otp/code' && !store.hasActiveChallenge) {
      return {
        path: '/auth/otp',
        query: typeof to.query.returnUrl === 'string' ? { returnUrl: to.query.returnUrl } : {},
      }
    }

    return true
  })

  await router.push(initialPath)
  await router.isReady()

  render(OtpCodeEntryPage, {
    global: {
      plugins: [pinia, router, i18n],
    },
  })
  return { router, store }
}

const seedChallenge = (store: ReturnType<typeof useOtpAuthStore>) => {
  store.email = 'buyer@example.test'
  store.challengeToken = 'challenge-001'
  store.expiresAt = '2026-12-01T00:10:00Z'
  store.canResendAt = '2026-12-01T00:01:00Z'
}

describe('OtpCodeEntryPage (buyer)', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-12-01T00:00:00Z'))
    jest.clearAllMocks()
  })

  const getDigitInput = (index: number) =>
    screen.getByLabelText(i18n.global.t('auth.otpCode.digitLabel', { index }))

  it('redirects to the request step when no active challenge exists', async () => {
    const { router } = await mountPage()

    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/auth/otp')
    })
  })

  it('submits challengeToken and code then navigates to backend redirectUrl', async () => {
    const { router, store } = await mountPage({ seed: seedChallenge })
    const pushSpy = jest.spyOn(router, 'push')
    const verifySpy = jest
      .spyOn(store, 'verifyOtp')
      .mockResolvedValue({ redirectUrl: '/orders', expiresAt: '2026-12-01T00:10:00Z' })

    const inputs = Array.from({ length: 6 }, (_, index) => getDigitInput(index + 1))
    await fireEvent.update(inputs[0], '1')
    await fireEvent.update(inputs[1], '2')
    await fireEvent.update(inputs[2], '3')
    await fireEvent.update(inputs[3], '4')
    await fireEvent.update(inputs[4], '5')
    await fireEvent.update(inputs[5], '6')
    await fireEvent.submit(screen.getByRole('button', { name: i18n.global.t('auth.otpCode.submit') }).closest('form')!)

    await waitFor(() => {
      expect(verifySpy).toHaveBeenCalledWith({
        code: '123456',
        returnUrl: '/checkout',
        culture: 'vi',
      })
    })

    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith('/orders')
    })
  })

  it('falls back to the buyer home route when verify response omits redirectUrl', async () => {
    const { router, store } = await mountPage({ initialPath: '/auth/otp/code', seed: seedChallenge })
    const pushSpy = jest.spyOn(router, 'push')
    jest
      .spyOn(store, 'verifyOtp')
      .mockResolvedValue({ redirectUrl: undefined, expiresAt: '2026-12-01T00:10:00Z' })

    const inputs = Array.from({ length: 6 }, (_, index) => getDigitInput(index + 1))
    await fireEvent.update(inputs[0], '1')
    await fireEvent.update(inputs[1], '2')
    await fireEvent.update(inputs[2], '3')
    await fireEvent.update(inputs[3], '4')
    await fireEvent.update(inputs[4], '5')
    await fireEvent.update(inputs[5], '6')
    await fireEvent.submit(screen.getByRole('button', { name: i18n.global.t('auth.otpCode.submit') }).closest('form')!)

    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith('/')
    })
  })

  it('blocks verification and shows expired feedback when the code is expired', async () => {
    const { store } = await mountPage({
      seed: (otpStore) => {
        seedChallenge(otpStore)
        otpStore.expiresAt = '2026-11-30T23:59:00Z'
      },
    })

    const verifySpy = jest.spyOn(store, 'verifyOtp')

    await waitFor(() => {
      expect(screen.getByText(i18n.global.t('auth.otpCode.expiredTitle'))).toBeTruthy()
    })

    expect(
      (screen.getByRole('button', {
        name: i18n.global.t('auth.otpCode.submit'),
      }) as HTMLButtonElement).disabled,
    ).toBe(true)
    expect(verifySpy).not.toHaveBeenCalled()
  })

  it('keeps resend disabled until the cooldown expires and then requests a new OTP', async () => {
    const { store } = await mountPage({ seed: seedChallenge })
    const requestSpy = jest.spyOn(store, 'requestOtp').mockResolvedValue()

    const resendButton = screen.getByRole('button', { name: i18n.global.t('auth.otpCode.resendAction') })
    expect((resendButton as HTMLButtonElement).disabled).toBe(true)

    jest.setSystemTime(new Date('2026-12-01T00:01:01Z'))
    jest.advanceTimersByTime(61_000)

    await waitFor(() => {
      expect((resendButton as HTMLButtonElement).disabled).toBe(false)
    })

    await fireEvent.click(resendButton)

    await waitFor(() => {
      expect(requestSpy).toHaveBeenCalledWith({
        email: 'buyer@example.test',
        returnUrl: '/checkout',
        culture: 'vi',
      })
    })
  })

  it('auto-advances focus and supports backspace navigation across digits', async () => {
    await mountPage({ seed: seedChallenge })

    const firstInput = getDigitInput(1) as HTMLInputElement
    const secondInput = getDigitInput(2) as HTMLInputElement

    await fireEvent.update(firstInput, '1')
    expect(document.activeElement).toBe(secondInput)

    await fireEvent.update(secondInput, '2')
    await fireEvent.keyDown(secondInput, { key: 'Backspace' })
    expect(secondInput.value).toBe('')

    await fireEvent.keyDown(secondInput, { key: 'Backspace' })
    expect(document.activeElement).toBe(firstInput)
  })

  it('distributes pasted digits across all six inputs', async () => {
    await mountPage({ seed: seedChallenge })

    await fireEvent.paste(getDigitInput(1), {
      clipboardData: {
        getData: () => '123456',
      },
    })

    expect((getDigitInput(1) as HTMLInputElement).value).toBe('1')
    expect((getDigitInput(2) as HTMLInputElement).value).toBe('2')
    expect((getDigitInput(3) as HTMLInputElement).value).toBe('3')
    expect((getDigitInput(4) as HTMLInputElement).value).toBe('4')
    expect((getDigitInput(5) as HTMLInputElement).value).toBe('5')
    expect((getDigitInput(6) as HTMLInputElement).value).toBe('6')
  })

  it('shows invalid code feedback and does not redirect when verification fails', async () => {
    const { router, store } = await mountPage({ seed: seedChallenge })
    const pushSpy = jest.spyOn(router, 'push')
    jest.spyOn(store, 'verifyOtp').mockRejectedValue({
      errors: [{ code: 'InvalidOtpCode' }],
    })

    for (let index = 1; index <= 6; index += 1) {
      await fireEvent.update(getDigitInput(index), String(index))
    }

    await fireEvent.submit(screen.getByRole('button', { name: i18n.global.t('auth.otpCode.submit') }).closest('form')!)

    await waitFor(() => {
      expect(screen.getByText(i18n.global.t('auth.errors.InvalidOtpCode'))).toBeTruthy()
    })
    expect(pushSpy).not.toHaveBeenCalled()
  })

  it('shows max-attempt feedback and does not redirect when verification is exhausted', async () => {
    const { router, store } = await mountPage({ seed: seedChallenge })
    const pushSpy = jest.spyOn(router, 'push')
    jest.spyOn(store, 'verifyOtp').mockRejectedValue({
      errors: [{ code: 'OtpAttemptsExceeded' }],
    })

    for (let index = 1; index <= 6; index += 1) {
      await fireEvent.update(getDigitInput(index), String(index))
    }

    await fireEvent.submit(screen.getByRole('button', { name: i18n.global.t('auth.otpCode.submit') }).closest('form')!)

    await waitFor(() => {
      expect(screen.getByText(i18n.global.t('auth.errors.OtpAttemptsExceeded'))).toBeTruthy()
    })
    expect(pushSpy).not.toHaveBeenCalled()
  })
})

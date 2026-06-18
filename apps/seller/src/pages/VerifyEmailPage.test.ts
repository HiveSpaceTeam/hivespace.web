import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import VerifyEmailPage from './VerifyEmailPage.vue'
import { accountService } from '@/services/account.service'

const mockNotifySuccess = jest.fn()
const mockNotifyError = jest.fn()
const mockStartCooldown = jest.fn()
const mockSetPendingVerificationEmail = jest.fn()
const mockCooldownActive = ref(false)
const mockCooldownSeconds = ref(60)
let mockPendingVerificationEmail = ''

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')

  return {
    ...actual,
    AuthLayout: {
      props: ['title', 'subtitle'],
      template: `
        <div data-testid="auth-layout">
          <h1>{{ title }}</h1>
          <p>{{ subtitle }}</p>
          <slot />
        </div>
      `,
    },
    Input: {
      props: ['modelValue', 'label', 'error', 'type', 'placeholder'],
      emits: ['update:modelValue'],
      template: `
        <label>
          <span>{{ label }}</span>
          <input
            :type="type"
            :value="modelValue"
            :placeholder="placeholder"
            @input="$emit('update:modelValue', $event.target.value)"
          />
          <span v-if="error">{{ error }}</span>
        </label>
      `,
    },
    Button: {
      props: ['disabled', 'type'],
      emits: ['click'],
      template: '<button :type="type" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    },
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifySuccess: mockNotifySuccess,
      notifyError: mockNotifyError,
    }),
    useCooldown: () => ({
      isActive: mockCooldownActive,
      secondsRemaining: mockCooldownSeconds,
      start: mockStartCooldown,
      stop: jest.fn(),
    }),
    getPendingVerificationEmail: jest.fn(() => mockPendingVerificationEmail),
    setPendingVerificationEmail: (...args: unknown[]) => mockSetPendingVerificationEmail(...args),
  }
})

jest.mock('@/services/account.service', () => ({
  accountService: {
    resendVerificationEmail: jest.fn(),
    verifyEmail: jest.fn(),
  },
}))

const renderPage = async (url = '/verify-email') => {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/verify-email', component: VerifyEmailPage, meta: { allowAnonymous: true } },
      { path: '/signin', component: { template: '<div>signin</div>' } },
    ],
  })

  await router.push(url)
  await router.isReady()

  render(VerifyEmailPage, { global: { plugins: [pinia, router, i18n] } })

  return { router }
}

describe('VerifyEmailPage (seller)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
    mockCooldownActive.value = false
    mockCooldownSeconds.value = 60
    mockPendingVerificationEmail = ''
    jest.mocked(accountService.resendVerificationEmail).mockResolvedValue(undefined)
  })

  it.each([
    ['pendingVerification', 'verifyEmail.messages.pendingVerificationRequired'],
    ['verificationRecovery', 'verifyEmail.messages.verificationRecovery'],
    ['duplicatePendingAccount', 'verifyEmail.messages.duplicatePendingAccount'],
  ])('renders guidance banner for %s outcome', async (outcome, key) => {
    await renderPage(`/verify-email?outcome=${outcome}`)

    expect(screen.getByText(i18n.global.t(key))).toBeTruthy()
  })

  it('renders previous-send success banner when maskedEmail exists', async () => {
    await renderPage('/verify-email?maskedEmail=t%2A%2A%2A%40mail.com')

    expect(screen.getByText(i18n.global.t('verifyEmail.messages.success'))).toBeTruthy()
    expect(screen.getByRole('button', { name: i18n.global.t('verifyEmail.actions.resendVerification') }))
      .toBeTruthy()
  })

  it('renders neutral state when there is no outcome or previous email', async () => {
    await renderPage('/verify-email')

    expect(screen.queryByText(i18n.global.t('verifyEmail.messages.success'))).toBeNull()
    expect(screen.queryByText(i18n.global.t('verifyEmail.messages.pendingVerificationRequired')))
      .toBeNull()
  })

  it('validates an empty email before submit', async () => {
    await renderPage('/verify-email')

    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('verifyEmail.actions.sendVerification') }),
    )

    expect(screen.getByText(i18n.global.t('verifyEmail.errors.emailRequired'))).toBeTruthy()
    expect(accountService.resendVerificationEmail).not.toHaveBeenCalled()
  })

  it('validates an invalid email before submit', async () => {
    mockPendingVerificationEmail = 'bad-email'
    await renderPage('/verify-email')

    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('verifyEmail.actions.sendVerification') }),
    )

    expect(accountService.resendVerificationEmail).not.toHaveBeenCalled()
  })

  it('submits valid email, persists pending email, starts cooldown, and shows success state', async () => {
    await renderPage('/verify-email?returnUrl=%2Fcheckout')

    await fireEvent.update(screen.getByRole('textbox'), 'seller@example.com')
    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('verifyEmail.actions.sendVerification') }),
    )

    await waitFor(() => {
      expect(accountService.resendVerificationEmail).toHaveBeenCalledWith({
        email: 'seller@example.com',
        app: 'seller',
        returnUrl: '/checkout',
        culture: 'vi',
      })
    })

    expect(mockSetPendingVerificationEmail).toHaveBeenCalledWith('seller', 'seller@example.com')
    await waitFor(() => {
      expect(mockStartCooldown).toHaveBeenCalled()
    })
    expect(mockNotifySuccess).toHaveBeenCalledWith(
      i18n.global.t('verifyEmail.messages.success'),
      i18n.global.t('verifyEmail.messages.verificationSent'),
    )
    expect(screen.getByText(i18n.global.t('verifyEmail.messages.verificationSent'))).toBeTruthy()
  })

  it('maps translated resend errors from backend codes', async () => {
    jest.mocked(accountService.resendVerificationEmail).mockRejectedValue({
      errors: [{ messageCode: 'validationFailed' }],
    })

    await renderPage('/verify-email')
    await fireEvent.update(screen.getByRole('textbox'), 'seller@example.com')
    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('verifyEmail.actions.sendVerification') }),
    )

    await waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalledWith(
        i18n.global.t('verifyEmail.messages.error'),
        i18n.global.t('verifyEmail.errors.validationFailed'),
      )
    })

    expect(screen.getByText(i18n.global.t('verifyEmail.errors.validationFailed'))).toBeTruthy()
  })

  it('falls back to validationFailed when resend error code is not translated', async () => {
    jest.mocked(accountService.resendVerificationEmail).mockRejectedValue({
      errors: [{ code: 'TotallyUnknown' }],
    })

    await renderPage('/verify-email')
    await fireEvent.update(screen.getByRole('textbox'), 'seller@example.com')
    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('verifyEmail.actions.sendVerification') }),
    )

    await waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalledWith(
        i18n.global.t('verifyEmail.messages.error'),
        i18n.global.t('verifyEmail.errors.validationFailed'),
      )
    })
  })

  it('renders cooldown button label and helper text while cooldown is active', async () => {
    mockCooldownActive.value = true
    mockCooldownSeconds.value = 42

    await renderPage('/verify-email?maskedEmail=t%2A%2A%2A%40mail.com')

    expect(
      screen.getByRole('button', { name: `${i18n.global.t('verifyEmail.actions.resendVerification')} (42s)` }),
    ).toBeTruthy()
    expect(screen.getByText(i18n.global.t('verifyEmail.messages.cooldownActive'))).toBeTruthy()
  })
})

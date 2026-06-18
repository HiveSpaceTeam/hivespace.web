import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { defineComponent, ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import EmailActionPage from './EmailActionPage.vue'

const mockNotifySuccess = jest.fn()
const mockNotifyError = jest.fn()
const mockStartCooldown = jest.fn()
const mockSetPendingVerificationEmail = jest.fn()
const mockResendVerificationEmail = jest.fn<
  (
    payload: Record<string, unknown>,
  ) => Promise<void>
>()
const mockCooldownActive = ref(false)
const mockCooldownSeconds = ref(60)
const mockIsSendingVerification = ref(false)
const mockValidateEmail = jest.fn((value: string, msg: string) => (value.includes('@') ? '' : msg))
const mockValidateRequired = jest.fn((value: string, msg: string) => (value.trim() ? '' : msg))
let mockPendingVerificationEmail = ''

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  const InputStub = defineComponent({
    inheritAttrs: false,
    props: {
      id: { type: String, required: true },
      modelValue: { type: String, default: '' },
      placeholder: { type: String, default: '' },
      error: { type: String, default: '' },
      disabled: { type: Boolean, default: false },
      type: { type: String, default: 'text' },
    },
    emits: ['update:modelValue'],
    template: `
      <div>
        <input
          :id="id"
          :type="type"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          @input="$emit('update:modelValue', $event.target.value)"
        />
        <span v-if="error">{{ error }}</span>
      </div>
    `,
  })
  const ButtonStub = defineComponent({
    props: {
      type: { type: String, default: 'button' },
      disabled: { type: Boolean, default: false },
    },
    emits: ['click'],
    template:
      '<button :type="type" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
  })
  return {
    ...actual,
    AppHeader: { template: '<header data-testid="app-header" />' },
    Input: InputStub,
    Button: ButtonStub,
    CheckIcon: { template: '<span />' },
    CheckLargeIcon: { template: '<span />' },
    CloseIcon: { template: '<span />' },
    EditIcon: { template: '<span />' },
    LoadingSpinnerIcon: { template: '<span />' },
    MailIcon: { template: '<span />' },
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
    validateEmail: (...args: unknown[]) => mockValidateEmail(...(args as [string, string])),
    validateRequired: (...args: unknown[]) =>
      mockValidateRequired(...(args as [string, string])),
  }
})

jest.mock('@/stores', () => ({
  useAccountStore: () => ({
    isSendingVerification: mockIsSendingVerification,
    resendVerificationEmail: mockResendVerificationEmail,
  }),
}))

const renderEmailAction = async (url = '/email-action') => {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/email-action', component: EmailActionPage, meta: { allowAnonymous: true } },
      { path: '/signin', component: { template: '<div>signin</div>' } },
    ],
  })
  await router.push(url)
  await router.isReady()

  render(EmailActionPage, { global: { plugins: [pinia, router, i18n] } })

  return { router }
}

describe('EmailActionPage (seller)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
    mockCooldownActive.value = false
    mockCooldownSeconds.value = 60
    mockIsSendingVerification.value = false
    mockPendingVerificationEmail = 'seller@example.com'
    mockValidateEmail.mockImplementation((value: string, msg: string) =>
      value.includes('@') ? '' : msg,
    )
    mockValidateRequired.mockImplementation((value: string, msg: string) =>
      value.trim() ? '' : msg,
    )
    mockResendVerificationEmail.mockResolvedValue(undefined)
  })

  it('submits resend verification with the pending email and return url', async () => {
    await renderEmailAction('/email-action?returnUrl=%2Fcheckout')

    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('verifyEmail.actions.sendVerification') }),
    )

    await waitFor(() => {
      expect(mockResendVerificationEmail).toHaveBeenCalledWith({
        email: 'seller@example.com',
        app: 'seller',
        returnUrl: '/checkout',
        culture: 'vi',
      })
    })

    expect(mockSetPendingVerificationEmail).toHaveBeenCalledWith('seller', 'seller@example.com')
    expect(mockStartCooldown).toHaveBeenCalled()
    expect(mockNotifySuccess).toHaveBeenCalledWith(
      i18n.global.t('verifyEmail.messages.success'),
      i18n.global.t('verifyEmail.messages.verificationSent'),
    )
  })

  it('confirms an edited email and shows the success toast', async () => {
    await renderEmailAction('/email-action?maskedEmail=s%2A%2A%2A%40mail.com&outcome=pendingVerification')

    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('verifyEmail.actions.editEmail') }),
    )
    await fireEvent.update(screen.getByRole('textbox'), 'next@example.com')

    const buttons = document.querySelectorAll('button[type="button"]')
    await fireEvent.click(buttons[0] as HTMLButtonElement)

    expect(mockSetPendingVerificationEmail).toHaveBeenCalledWith('seller', 'next@example.com')
    expect(mockNotifySuccess).toHaveBeenCalledWith(
      i18n.global.t('verifyEmail.messages.emailUpdated'),
      i18n.global.t('verifyEmail.messages.emailUpdatedSuccess'),
    )
  })

  it('cancels email editing and restores the original value', async () => {
    await renderEmailAction('/email-action?maskedEmail=s%2A%2A%2A%40mail.com&outcome=pendingVerification')

    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('verifyEmail.actions.editEmail') }),
    )
    const textbox = screen.getByRole('textbox')
    await fireEvent.update(textbox, 'other@example.com')

    const buttons = document.querySelectorAll('button[type="button"]')
    await fireEvent.click(buttons[1] as HTMLButtonElement)

    expect((textbox as HTMLInputElement).value).toBe('seller@example.com')
    expect(mockSetPendingVerificationEmail).not.toHaveBeenCalledWith(
      'seller',
      'other@example.com',
    )
  })

  it('blocks invalid email submits and shows a validation error toast', async () => {
    mockPendingVerificationEmail = 'seller@example.com'
    mockValidateEmail.mockImplementation(() => i18n.global.t('verifyEmail.errors.emailInvalid'))
    await renderEmailAction()

    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('verifyEmail.actions.sendVerification') }),
    )

    expect(mockResendVerificationEmail).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalledWith(
        i18n.global.t('verifyEmail.messages.error'),
        i18n.global.t('verifyEmail.messages.validationFailed'),
      )
    })
  })

  it('maps resend failures into the page error state without navigating', async () => {
    const { router } = await renderEmailAction()
    mockResendVerificationEmail.mockRejectedValue({
      errors: [{ code: 'TotallyUnknown' }],
    })

    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('verifyEmail.actions.sendVerification') }),
    )

    await waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalledWith(
        i18n.global.t('verifyEmail.messages.error'),
        i18n.global.t('verifyEmail.errors.validationFailed'),
      )
    })

    expect(router.currentRoute.value.path).toBe('/email-action')
    expect(screen.getByText(i18n.global.t('verifyEmail.errors.validationFailed'))).toBeTruthy()
  })
})

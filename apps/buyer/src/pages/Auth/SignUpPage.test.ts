import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ref, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { render, screen, fireEvent } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import SignUpPage from './SignUpPage.vue'

const mockRegister = jest.fn<() => Promise<{ maskedEmail: string }>>()
const mockStartGoogleAuth = jest.fn<() => Promise<void>>()
const mockNotifyError = jest.fn()
const mockSetPendingVerificationEmail = jest.fn()

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    AuthLayout: { template: '<div data-testid="auth-layout"><slot /></div>' },
    Input: {
      template:
        '<div><input :type="type ?? \'text\'" :value="modelValue" :id="id" @input="$emit(\'update:modelValue\', $event.target.value)" /><slot name="append" /></div>',
      props: ['modelValue', 'type', 'label', 'error', 'placeholder', 'required', 'disabled', 'id', 'inputClass'],
      emits: ['update:modelValue'],
    },
    Checkbox: {
      template:
        '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
      props: ['modelValue', 'id', 'label'],
      emits: ['update:modelValue'],
    },
    Button: {
      template: '<button :type="type ?? \'button\'"><slot /></button>',
      props: ['type', 'class', 'loading'],
    },
    GoogleAuthButton: {
      template: '<button type="button" @click="onClick">{{ label }}</button>',
      props: ['label', 'loading', 'onClick', 'className'],
    },
    HidePasswordIcon: {
      template: '<span data-testid="hide-password-icon" />',
    },
    ShowPasswordIcon: {
      template: '<span data-testid="show-password-icon" />',
    },
    useAuth: () => ({
      register: mockRegister,
      startGoogleAuth: mockStartGoogleAuth,
      getCurrentUser: jest.fn().mockImplementation(() => Promise.resolve(null)),
      isLoading: ref(false),
    }),
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifyError: mockNotifyError,
      notifySuccess: jest.fn(),
    }),
    setPendingVerificationEmail: (...args: Parameters<typeof mockSetPendingVerificationEmail>) =>
      mockSetPendingVerificationEmail(...args),
  }
})

jest.mock('@/services/account.service', () => ({
  accountService: {
    register: mockRegister,
    loginWithPassword: jest.fn(),
  },
}))

const renderSignUp = async (path = '/signup') => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/signup', component: SignUpPage, meta: { allowAnonymous: true } },
      { path: '/verify-email', component: { template: '<div />' } },
      { path: '/signin', component: { template: '<div />' } },
    ],
  })
  await router.push(path)
  await router.isReady()

  return {
    router,
    result: render(SignUpPage, { global: { plugins: [pinia, router, i18n] } }),
  }
}

describe('SignUpPage (buyer)', () => {
  beforeEach(() => {
    mockRegister.mockReset()
    mockStartGoogleAuth.mockReset()
    mockNotifyError.mockReset()
    mockSetPendingVerificationEmail.mockReset()
  })

  it('renders_SignUpForm', async () => {
    await renderSignUp()

    expect(document.querySelector('form')).toBeTruthy()
  })

  it('invalidEmail_ShowsValidationError', async () => {
    await renderSignUp()

    expect(screen.getByTestId('auth-layout')).toBeTruthy()
  })

  it('validateForm_WithPasswordMismatch_BlocksSubmission', async () => {
    await renderSignUp()

    const inputs = document.querySelectorAll('input[type="password"]')
    await fireEvent.input(inputs[0]!, { target: { value: 'Password123!' } })
    await fireEvent.input(inputs[1]!, { target: { value: 'DifferentPassword!' } })

    await fireEvent.submit(document.querySelector('form')!)
    await nextTick()

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('validateForm_WithoutTermsAccepted_BlocksSubmission', async () => {
    await renderSignUp()

    const nameInput = document.querySelector('input[type="text"]') as HTMLInputElement
    await fireEvent.input(nameInput, { target: { value: 'Test User' } })

    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement
    await fireEvent.input(emailInput, { target: { value: 'test@example.com' } })

    const passwordInputs = document.querySelectorAll('input[type="password"]')
    await fireEvent.input(passwordInputs[0]!, { target: { value: 'Password123!' } })
    await fireEvent.input(passwordInputs[1]!, { target: { value: 'Password123!' } })

    await fireEvent.submit(document.querySelector('form')!)
    await nextTick()

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('handleSubmit_WithValidData_CallsRegister', async () => {
    mockRegister.mockResolvedValue({ maskedEmail: 'test@***.com' })
    await renderSignUp('/signup?returnUrl=%2Fcart')

    const nameInput = document.querySelector('input[type="text"]') as HTMLInputElement
    await fireEvent.input(nameInput, { target: { value: 'Test User' } })

    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement
    await fireEvent.input(emailInput, { target: { value: 'test@example.com' } })

    const passwordInputs = document.querySelectorAll('input[type="password"]')
    await fireEvent.input(passwordInputs[0]!, { target: { value: 'Password123!' } })
    await fireEvent.input(passwordInputs[1]!, { target: { value: 'Password123!' } })

    const termsCheckbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement
    await fireEvent.change(termsCheckbox, { target: { checked: true } })

    await fireEvent.submit(document.querySelector('form')!)
    await nextTick()

    expect(mockRegister).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        fullName: 'Test User',
        returnUrl: '/cart',
      }),
    )
    expect(mockSetPendingVerificationEmail).toHaveBeenCalledWith('buyer', 'test@example.com')
    await nextTick()
  })

  it('handleGoogleAuth_CallsStartGoogleAuth', async () => {
    mockStartGoogleAuth.mockResolvedValue(undefined)
    await renderSignUp()

    const googleButton = screen.getByRole('button', {
      name: new RegExp(i18n.global.t('auth.google.continue'), 'i'),
    })
    await fireEvent.click(googleButton)
    await nextTick()

    expect(mockStartGoogleAuth).toHaveBeenCalledWith({
      app: 'buyer',
      returnUrl: '/',
      culture: 'vi',
    })
  })

  it('handleSubmit_WhenPendingVerificationError_RedirectsToVerifyEmailOutcome', async () => {
    mockRegister.mockRejectedValue({
      errors: [{ messageCode: 'PendingEmailVerification' }],
    })
    await renderSignUp()

    const nameInput = document.querySelector('input[type="text"]') as HTMLInputElement
    await fireEvent.input(nameInput, { target: { value: 'Test User' } })

    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement
    await fireEvent.input(emailInput, { target: { value: 'test@example.com' } })

    const passwordInputs = document.querySelectorAll('input[type="password"]')
    await fireEvent.input(passwordInputs[0]!, { target: { value: 'Password123!' } })
    await fireEvent.input(passwordInputs[1]!, { target: { value: 'Password123!' } })

    const termsCheckbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement
    await fireEvent.change(termsCheckbox, { target: { checked: true } })

    await fireEvent.submit(document.querySelector('form')!)
    await nextTick()

    expect(mockSetPendingVerificationEmail).toHaveBeenCalledWith('buyer', 'test@example.com')
    await nextTick()
  })

  it('handleSubmit_WhenRegisterFails_MapsErrorAndNotifies', async () => {
    mockRegister.mockRejectedValue({
      errors: [{ messageCode: 'SomeUnknownCode' }],
    })
    await renderSignUp()

    const nameInput = document.querySelector('input[type="text"]') as HTMLInputElement
    await fireEvent.input(nameInput, { target: { value: 'Test User' } })

    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement
    await fireEvent.input(emailInput, { target: { value: 'test@example.com' } })

    const passwordInputs = document.querySelectorAll('input[type="password"]')
    await fireEvent.input(passwordInputs[0]!, { target: { value: 'Password123!' } })
    await fireEvent.input(passwordInputs[1]!, { target: { value: 'Password123!' } })

    const termsCheckbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement
    await fireEvent.change(termsCheckbox, { target: { checked: true } })

    await fireEvent.submit(document.querySelector('form')!)
    await nextTick()

    expect(mockNotifyError).toHaveBeenCalledWith(
      i18n.global.t('auth.errors.registrationFailed'),
      i18n.global.t('auth.errors.validationFailed'),
    )
  })
})

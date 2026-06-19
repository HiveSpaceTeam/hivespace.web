import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { defineComponent, h, ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import SignUpPage from './SignUpPage.vue'

const mockRegister = jest.fn<
  (
    payload: Record<string, unknown>,
  ) => Promise<{ maskedEmail: string }>
>()
const mockGetCurrentUser = jest.fn<() => Promise<null>>()
const mockStartGoogleAuth = jest.fn()
const mockNotifyError = jest.fn()
const mockSetPendingVerificationEmail = jest.fn()
const mockNormalizeFrontendRedirect = jest.fn(
  (url: unknown, fallback: string) => (typeof url === 'string' && url.startsWith('/') ? url : fallback),
)

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  const InputStub = defineComponent({
    props: {
      id: { type: String, required: true },
      modelValue: { type: String, default: '' },
      label: { type: String, default: '' },
      error: { type: String, default: '' },
      type: { type: String, default: 'text' },
      placeholder: { type: String, default: '' },
    },
    emits: ['update:modelValue'],
    template: `
      <label :for="id">
        <span>{{ label }}</span>
        <input
          :id="id"
          :type="type"
          :value="modelValue"
          :placeholder="placeholder"
          @input="$emit('update:modelValue', $event.target.value)"
        />
        <slot name="append" />
        <span v-if="error">{{ error }}</span>
      </label>
    `,
  })
  const CheckboxStub = defineComponent({
    props: {
      id: { type: String, required: true },
      modelValue: { type: Boolean, default: false },
      label: { type: String, default: '' },
    },
    emits: ['update:modelValue'],
    template: `
      <label :for="id">
        <input
          :id="id"
          type="checkbox"
          :checked="modelValue"
          @change="$emit('update:modelValue', $event.target.checked)"
        />
        <span>{{ label }}</span>
        <slot />
      </label>
    `,
  })
  const ButtonStub = defineComponent({
    props: {
      type: { type: String, default: 'button' },
      disabled: { type: Boolean, default: false },
      loading: { type: Boolean, default: false },
    },
    emits: ['click'],
    template:
      '<button :type="type" :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
  })
  const GoogleAuthButtonStub = defineComponent({
    props: {
      label: { type: String, default: '' },
      onClick: { type: Function, default: undefined },
      loading: { type: Boolean, default: false },
    },
    setup(props) {
      return () =>
        h(
          'button',
          {
            type: 'button',
            disabled: props.loading,
            onClick: () => props.onClick?.(),
          },
          props.label,
        )
    },
  })
  return {
    ...actual,
    AuthLayout: { template: '<div data-testid="auth-layout"><slot /></div>' },
    Input: InputStub,
    Checkbox: CheckboxStub,
    Button: ButtonStub,
    GoogleAuthButton: GoogleAuthButtonStub,
    HidePasswordIcon: { template: '<span />' },
    ShowPasswordIcon: { template: '<span />' },
    useAuth: () => ({
      register: mockRegister,
      startGoogleAuth: mockStartGoogleAuth,
      getCurrentUser: mockGetCurrentUser.mockResolvedValue(null),
      isLoading: ref(false),
    }),
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifyError: mockNotifyError,
      notifySuccess: jest.fn(),
    }),
    setPendingVerificationEmail: (...args: unknown[]) => mockSetPendingVerificationEmail(...args),
    normalizeFrontendRedirect: (...args: unknown[]) =>
      mockNormalizeFrontendRedirect(...(args as [unknown, string])),
    validateEmail: jest.fn((value: string, msg: string) => (value.includes('@') ? '' : msg)),
    validateRequired: jest.fn((value: string, msg: string) => (value.trim() ? '' : msg)),
  }
})

const renderSignUp = async (url = '/signup') => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/signup', component: SignUpPage, meta: { allowAnonymous: true } },
      { path: '/signin', component: { template: '<div>signin</div>' } },
      { path: '/verify-email', component: { template: '<div>verify-email</div>' } },
      { path: '/product/list', component: { template: '<div>products</div>' } },
    ],
  })
  await router.push(url)
  await router.isReady()

  render(SignUpPage, { global: { plugins: [pinia, router, i18n] } })

  return { router }
}

describe('SignUpPage (seller)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
    mockRegister.mockResolvedValue({ maskedEmail: 's***@example.com' })
  })

  it('blocks submit when validation fails', async () => {
    await renderSignUp()

    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('auth.register.submit') }),
    )

    expect(mockRegister).not.toHaveBeenCalled()
    expect(screen.getByText(i18n.global.t('auth.errors.fullNameRequired'))).toBeTruthy()
    expect(screen.getByText(i18n.global.t('auth.errors.emailRequired'))).toBeTruthy()
    expect(screen.getByText(i18n.global.t('auth.errors.termsRequired'))).toBeTruthy()
  })

  it('submits valid registration and redirects to verify email', async () => {
    const { router } = await renderSignUp('/signup?returnUrl=%2Fcheckout')

    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('auth.register.fullName')),
      'Seller User',
    )
    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('auth.register.email')),
      'seller@example.com',
    )
    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('auth.register.password')),
      'SellerPass123',
    )
    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('auth.register.confirmPassword')),
      'SellerPass123',
    )
    await fireEvent.click(screen.getByLabelText(i18n.global.t('auth.register.acceptTerms')))
    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('auth.register.submit') }),
    )

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        fullName: 'Seller User',
        email: 'seller@example.com',
        password: 'SellerPass123',
        confirmPassword: 'SellerPass123',
        app: 'seller',
        returnUrl: '/checkout',
        culture: 'vi',
      })
    })

    expect(mockSetPendingVerificationEmail).toHaveBeenCalledWith(
      'seller',
      'seller@example.com',
    )
    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/verify-email')
    })
    expect(router.currentRoute.value.query).toMatchObject({
      maskedEmail: 's***@example.com',
      returnUrl: '/checkout',
    })
  })

  it('redirects duplicate pending accounts to verify email recovery flow', async () => {
    const { router } = await renderSignUp('/signup?returnUrl=%2Forders')
    mockRegister.mockRejectedValue({
      errors: [{ messageCode: 'PendingEmailVerification' }],
    })

    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('auth.register.fullName')),
      'Seller User',
    )
    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('auth.register.email')),
      'seller@example.com',
    )
    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('auth.register.password')),
      'SellerPass123',
    )
    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('auth.register.confirmPassword')),
      'SellerPass123',
    )
    await fireEvent.click(screen.getByLabelText(i18n.global.t('auth.register.acceptTerms')))
    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('auth.register.submit') }),
    )

    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/verify-email')
    })

    expect(mockSetPendingVerificationEmail).toHaveBeenCalledWith(
      'seller',
      'seller@example.com',
    )
    expect(router.currentRoute.value.query).toMatchObject({
      outcome: 'duplicatePendingAccount',
      returnUrl: '/orders',
    })
  })

  it('starts google auth with the normalized return url', async () => {
    await renderSignUp('/signup?returnUrl=%2Fcart')

    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('auth.google.continue') }),
    )

    expect(mockStartGoogleAuth).toHaveBeenCalledWith({
      app: 'seller',
      returnUrl: '/cart',
      culture: 'vi',
    })
  })
})

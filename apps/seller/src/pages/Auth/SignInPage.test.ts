import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { defineComponent, h, ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import SignInPage from './SignInPage.vue'

const mockLogin = jest.fn<
  (
    payload: Record<string, unknown>,
  ) => Promise<{ redirectTo: string }>
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
    Button: ButtonStub,
    GoogleAuthButton: GoogleAuthButtonStub,
    HidePasswordIcon: { template: '<span />' },
    ShowPasswordIcon: { template: '<span />' },
    useAuth: () => ({
      login: mockLogin,
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

const renderSignIn = async (url = '/signin') => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/signin', component: SignInPage, meta: { allowAnonymous: true } },
      { path: '/verify-email', component: { template: '<div>verify-email</div>' } },
      { path: '/product/list', component: { template: '<div>products</div>' } },
      { path: '/orders/all', component: { template: '<div>orders</div>' } },
      { path: '/signup', component: { template: '<div>signup</div>' } },
    ],
  })
  await router.push(url)
  await router.isReady()

  render(SignInPage, { global: { plugins: [pinia, router, i18n] } })

  return { router }
}

describe('SignInPage (seller)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
    mockLogin.mockResolvedValue({ redirectTo: '/orders/all' })
  })

  it('renders route outcome errors on load', async () => {
    await renderSignIn('/signin?outcome=GoogleLinkDeclined')

    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText(i18n.global.t('auth.errors.GoogleLinkDeclined'))).toBeTruthy()
  })

  it('blocks submit when validation fails', async () => {
    await renderSignIn()

    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('auth.signIn.submit') }),
    )

    expect(mockLogin).not.toHaveBeenCalled()
    expect(screen.getByText(i18n.global.t('auth.errors.emailRequired'))).toBeTruthy()
    expect(screen.getByText(i18n.global.t('auth.errors.passwordRequired'))).toBeTruthy()
  })

  it('submits valid credentials and navigates to the returned path', async () => {
    const { router } = await renderSignIn('/signin?returnUrl=%2Fcheckout')

    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('auth.signIn.email')),
      'seller@example.com',
    )
    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('auth.signIn.password')),
      'SellerPass123',
    )
    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('auth.signIn.submit') }),
    )

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'seller@example.com',
        password: 'SellerPass123',
        app: 'seller',
        returnUrl: '/checkout',
        culture: 'vi',
      })
    })

    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/orders/all')
    })
  })

  it('redirects pending verification errors to verify email', async () => {
    const { router } = await renderSignIn('/signin?returnUrl=%2Fcatalog')
    mockLogin.mockRejectedValue({
      errors: [{ messageCode: 'EmailVerificationRequired' }],
    })

    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('auth.signIn.email')),
      'seller@example.com',
    )
    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('auth.signIn.password')),
      'SellerPass123',
    )
    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('auth.signIn.submit') }),
    )

    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/verify-email')
    })

    expect(mockSetPendingVerificationEmail).toHaveBeenCalledWith(
      'seller',
      'seller@example.com',
    )
    expect(router.currentRoute.value.query).toMatchObject({
      returnUrl: '/catalog',
      outcome: 'pendingVerification',
    })
  })

  it('starts google auth with the normalized return url', async () => {
    await renderSignIn('/signin?returnUrl=%2Fcart')

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

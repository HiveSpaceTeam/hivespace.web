import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { defineComponent, h, ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import GoogleLinkPage from './GoogleLinkPage.vue'

const mockConfirmGoogleLink = jest.fn<
  (
    payload: Record<string, unknown>,
  ) => Promise<{ redirectTo: string }>
>()
const mockCancelGoogleLink = jest.fn<(linkToken: string) => Promise<void>>()
const mockStartGoogleAuth = jest.fn()
const mockNotifyError = jest.fn()
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
        <slot />
      </label>
    `,
  })
  const ButtonStub = defineComponent({
    props: {
      type: { type: String, default: 'button' },
      disabled: { type: Boolean, default: false },
      loading: { type: Boolean, default: false },
      onClick: { type: Function, default: undefined },
    },
    emits: ['click'],
    setup(props, { slots, emit }) {
      return () =>
        h(
          'button',
          {
            type: props.type,
            disabled: props.disabled || props.loading,
            onClick: async () => {
              emit('click')
              await props.onClick?.()
            },
          },
          slots.default?.(),
        )
    },
  })
  return {
    ...actual,
    AuthLayout: { template: '<div data-testid="auth-layout"><slot /></div>' },
    Input: InputStub,
    Checkbox: CheckboxStub,
    Button: ButtonStub,
    HidePasswordIcon: { template: '<span />' },
    ShowPasswordIcon: { template: '<span />' },
    useAuth: () => ({
      confirmGoogleLink: mockConfirmGoogleLink,
      cancelGoogleLink: mockCancelGoogleLink,
      startGoogleAuth: mockStartGoogleAuth,
      isLoading: ref(false),
    }),
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifySuccess: jest.fn(),
      notifyError: mockNotifyError,
    }),
    normalizeFrontendRedirect: (...args: unknown[]) =>
      mockNormalizeFrontendRedirect(...(args as [unknown, string])),
    validateRequired: jest.fn((value: string, msg: string) => (value.trim() ? '' : msg)),
  }
})

const renderGoogleLink = async (url = '/auth/google-link') => {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/auth/google-link', component: GoogleLinkPage, meta: { allowAnonymous: true } },
      { path: '/signin', component: { template: '<div>signin</div>' } },
      { path: '/product/list', component: { template: '<div>products</div>' } },
      { path: '/orders/all', component: { template: '<div>orders</div>' } },
    ],
  })
  await router.push(url)
  await router.isReady()

  render(GoogleLinkPage, { global: { plugins: [pinia, router, i18n] } })

  return { router }
}

describe('GoogleLinkPage (seller)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
    mockConfirmGoogleLink.mockResolvedValue({ redirectTo: '/orders/all' })
    mockCancelGoogleLink.mockResolvedValue(undefined)
  })

  it('blocks confirmation without a valid token', async () => {
    await renderGoogleLink()

    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('auth.googleLink.password')),
      'SellerPass123',
    )
    await fireEvent.click(screen.getByLabelText(i18n.global.t('auth.googleLink.consent')))
    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('auth.googleLink.confirm') }),
    )

    expect(mockConfirmGoogleLink).not.toHaveBeenCalled()
    expect(screen.getByText(i18n.global.t('auth.errors.GoogleLinkExpired'))).toBeTruthy()
  })

  it('confirms a google link and redirects to the returned path', async () => {
    const { router } = await renderGoogleLink(
      '/auth/google-link?linkToken=token-123&returnUrl=%2Fcheckout',
    )

    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('auth.googleLink.password')),
      'SellerPass123',
    )
    await fireEvent.click(screen.getByLabelText(i18n.global.t('auth.googleLink.consent')))
    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('auth.googleLink.confirm') }),
    )

    await waitFor(() => {
      expect(mockConfirmGoogleLink).toHaveBeenCalledWith({
        consentAccepted: true,
        password: 'SellerPass123',
        linkToken: 'token-123',
        app: 'seller',
        returnUrl: '/checkout',
        culture: 'vi',
      })
    })

    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/orders/all')
    })
  })

  it('cancels the google link and returns to sign in with an error query', async () => {
    const { router } = await renderGoogleLink(
      '/auth/google-link?linkToken=token-123&returnUrl=%2Fcatalog',
    )

    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('auth.googleLink.cancel') }),
    )

    await waitFor(() => {
      expect(mockCancelGoogleLink).toHaveBeenCalledWith('token-123')
    })

    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/signin')
    })
    expect(router.currentRoute.value.query).toMatchObject({
      error: 'GoogleLinkDeclined',
      returnUrl: '/catalog',
    })
  })

  it('restarts google auth with the normalized return url', async () => {
    await renderGoogleLink('/auth/google-link?returnUrl=%2Fcart')

    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('auth.googleLink.useAnotherGoogle') }),
    )

    expect(mockStartGoogleAuth).toHaveBeenCalledWith({
      app: 'seller',
      returnUrl: '/cart',
      culture: 'vi',
    })
  })
})

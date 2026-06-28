import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import OtpSignInPage from './OtpSignInPage.vue'
import { useOtpAuthStore } from '@/stores/otp-auth.store'

jest.mock('@/stores', () => ({
  useOtpAuthStore:
    jest.requireActual<typeof import('@/stores/otp-auth.store')>(
      '@/stores/otp-auth.store',
    ).useOtpAuthStore,
}))

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
    Input: {
      props: ['id', 'modelValue', 'label', 'placeholder', 'error', 'type', 'required'],
      emits: ['update:modelValue'],
      template: `
        <div>
          <label :for="id">{{ label }}</label>
          <input
            :id="id"
            :type="type || 'text'"
            :value="modelValue"
            :placeholder="placeholder"
            :required="required"
            @input="$emit('update:modelValue', $event.target.value)"
          />
          <p v-if="error">{{ error }}</p>
        </div>
      `,
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
      app: 'seller',
      gatewayBaseUrl: 'http://localhost:5000',
    },
  },
}))

const mountPage = async (initialPath = '/auth/otp?returnUrl=%2Forders%2Fall') => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useOtpAuthStore()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/auth/otp', component: OtpSignInPage, meta: { allowAnonymous: true } },
      { path: '/auth/otp/code', component: { template: '<div>otp-code</div>' }, meta: { allowAnonymous: true } },
      { path: '/signin', component: { template: '<div>signin</div>' }, meta: { allowAnonymous: true } },
    ],
  })

  await router.push(initialPath)
  await router.isReady()

  render(OtpSignInPage, {
    global: {
      plugins: [pinia, router, i18n],
    },
  })

  return { router, store }
}

describe('OtpSignInPage (seller)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('submits the request step and navigates to code entry with the preserved returnUrl', async () => {
    const { router, store } = await mountPage()
    const pushSpy = jest.spyOn(router, 'push')
    const requestSpy = jest.spyOn(store, 'requestOtp').mockResolvedValue()

    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('auth.otpRequest.email')),
      'seller@example.test',
    )
    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('auth.otpRequest.submit') }),
    )

    await waitFor(() => {
      expect(requestSpy).toHaveBeenCalledWith({
        email: 'seller@example.test',
        returnUrl: '/orders/all',
        culture: 'vi',
      })
    })

    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith({
        path: '/auth/otp/code',
        query: { returnUrl: '/orders/all' },
      })
    })
  })

  it('resets otp state when returning to password sign in', async () => {
    const { router, store } = await mountPage()

    store.email = 'seller@example.test'
    store.challengeToken = 'challenge-001'
    store.expiresAt = '2026-12-01T00:10:00Z'
    store.canResendAt = '2026-12-01T00:01:00Z'

    await fireEvent.click(
      screen.getByRole('link', { name: i18n.global.t('auth.actions.backToSignIn') }),
    )

    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/signin')
    })
    expect(store.email).toBe('')
    expect(store.challengeToken).toBeNull()
    expect(store.expiresAt).toBeNull()
    expect(store.canResendAt).toBeNull()
  })
})

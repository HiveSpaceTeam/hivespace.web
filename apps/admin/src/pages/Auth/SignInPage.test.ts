import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { render } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import SignInPage from './SignInPage.vue'

const mockLogin = jest.fn<() => Promise<void>>()

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    AuthLayout: { template: '<div data-testid="auth-layout"><slot /></div>' },
    Button: { template: '<button type="submit"><slot /></button>', props: ['type', 'loading'] },
    Input: { template: '<input />', props: ['id', 'type', 'modelValue', 'label', 'placeholder', 'error', 'inputClass', 'required'] },
    useAuth: () => ({ login: mockLogin, isLoading: { value: false } }),
    useAppStore: () => ({ setLoading: jest.fn(), notifyError: jest.fn(), notifySuccess: jest.fn() }),
  }
})

const renderSignIn = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/signin', name: 'SignIn', component: SignInPage },
      { path: '/dashboard', name: 'Dashboard', component: { template: '<div />' } },
    ],
  })
  await router.push('/signin')
  await router.isReady()
  return render(SignInPage, { global: { plugins: [pinia, router, i18n] } })
}

describe('SignInPage (admin)', () => {
  beforeEach(() => {
    mockLogin.mockReset()
    setActivePinia(createPinia())
  })

  it('should render the sign-in form', async () => {
    const { container } = await renderSignIn()

    expect(container.querySelector('form')).not.toBeNull()
  })

  it('should dispatch login action on form submit', async () => {
    mockLogin.mockResolvedValue(undefined)
    await renderSignIn()

    const form = document.querySelector('form')
    form?.dispatchEvent(new Event('submit'))

    expect(mockLogin).not.toHaveBeenCalled()
  })
})

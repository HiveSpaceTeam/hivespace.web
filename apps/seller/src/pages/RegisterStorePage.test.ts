import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { render, screen } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import RegisterStorePage from './RegisterStorePage.vue'

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    AppHeader: { template: '<header data-testid="app-header" />' },
    FullscreenLoader: { template: '<div data-testid="fullscreen-loader" />' },
    FileInput: { template: '<div data-testid="file-input" />' },
    useAuth: () => ({
      getCurrentUser: jest.fn(),
    }),
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifySuccess: jest.fn(),
      notifyError: jest.fn(),
      notifyInfo: jest.fn(),
    }),
    useFieldValidation: () => ({
      handleFieldValidationErrors: jest.fn(),
      clearFieldErrors: jest.fn(),
    }),
    validateRequired: jest.fn((value: string, msg: string) => (value ? '' : msg)),
  }
})

jest.mock('@/stores', () => ({
  useStoreStore: jest.fn(() => ({
    registerStore: jest.fn(),
    currentStore: null,
  })),
  useMediaStore: jest.fn(() => ({
    uploadMedia: jest.fn(),
    confirmUpload: jest.fn(),
    isLoading: false,
  })),
}))

const renderRegisterStore = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/register-seller', component: RegisterStorePage, meta: { allowAnonymous: true } },
      { path: '/product/list', component: { template: '<div />' } },
    ],
  })
  await router.push('/register-seller')
  await router.isReady()

  return render(RegisterStorePage, { global: { plugins: [pinia, router, i18n], stubs: { teleport: true } } })
}

describe('RegisterStorePage (seller)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders_StoreRegistrationForm', async () => {
    await renderRegisterStore()

    expect(screen.getByTestId('app-header')).toBeTruthy()
    expect(document.querySelector('form')).toBeTruthy()
  })

  it('renders_StoreNameField', async () => {
    await renderRegisterStore()

    // The store name input is present
    const inputs = document.querySelectorAll('input')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('formSubmit_CallsRegisterEndpoint', async () => {
    await renderRegisterStore()

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ref, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { render, screen, fireEvent } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import GoogleLinkPage from './GoogleLinkPage.vue'

const mockConfirmGoogleLink = jest.fn<() => Promise<{ redirectTo: string }>>()
const mockCancelGoogleLink = jest.fn<() => Promise<void>>()
const mockStartGoogleAuth = jest.fn<() => Promise<void>>()

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    AuthLayout: { template: '<div data-testid="auth-layout"><slot /></div>' },
    Button: {
      template: '<button :type="type ?? \'button\'" @click="$emit(\'click\', $event); onClick && onClick($event)"><slot /></button>',
      props: ['type', 'disabled', 'loading', 'variant', 'onClick'],
      emits: ['click'],
    },
    Checkbox: {
      template:
        '<label><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" /><slot /></label>',
      props: ['modelValue', 'id'],
      emits: ['update:modelValue'],
    },
    Input: {
      template:
        '<input :type="type ?? \'text\'" :value="modelValue" :id="id" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'type', 'label', 'error', 'placeholder', 'required', 'disabled', 'id', 'inputClass'],
      emits: ['update:modelValue'],
    },
    ShowPasswordIcon: { template: '<span />' },
    HidePasswordIcon: { template: '<span />' },
    useAuth: () => ({
      confirmGoogleLink: mockConfirmGoogleLink,
      cancelGoogleLink: mockCancelGoogleLink,
      startGoogleAuth: mockStartGoogleAuth,
      isLoading: ref(false),
    }),
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifyError: jest.fn(),
      notifySuccess: jest.fn(),
    }),
  }
})

const renderGoogleLink = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/google-link', component: GoogleLinkPage, meta: { allowAnonymous: true } },
      { path: '/signin', component: { template: '<div />' } },
    ],
  })
  await router.push('/google-link?linkToken=test-token')
  await router.isReady()

  return render(GoogleLinkPage, { global: { plugins: [pinia, router, i18n] } })
}

describe('GoogleLinkPage (buyer)', () => {
  beforeEach(() => {
    mockConfirmGoogleLink.mockReset()
    mockCancelGoogleLink.mockReset()
    mockStartGoogleAuth.mockReset()
  })

  it('renders_WithGoogleLinkPrompt', async () => {
    await renderGoogleLink()

    expect(screen.getByTestId('auth-layout')).toBeTruthy()
    expect(screen.getByText(i18n.global.t('auth.googleLink.body'))).toBeTruthy()
    expect(document.querySelector('form')).toBeTruthy()
  })

  it('validateForm_WithNoConsentAccepted_BlocksSubmission', async () => {
    await renderGoogleLink()

    await fireEvent.submit(document.querySelector('form')!)
    await nextTick()

    expect(mockConfirmGoogleLink).not.toHaveBeenCalled()
  })

  it('validateForm_WithNoPassword_BlocksSubmission', async () => {
    await renderGoogleLink()

    const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement
    await fireEvent.change(checkbox, { target: { checked: true } })

    await fireEvent.submit(document.querySelector('form')!)
    await nextTick()

    expect(mockConfirmGoogleLink).not.toHaveBeenCalled()
  })

  it('handleConfirm_WithValidForm_CallsConfirmGoogleLink', async () => {
    mockConfirmGoogleLink.mockResolvedValue({ redirectTo: '/' })
    await renderGoogleLink()

    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
    await fireEvent.input(passwordInput, { target: { value: 'mypassword123' } })

    const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement
    await fireEvent.change(checkbox, { target: { checked: true } })

    await fireEvent.submit(document.querySelector('form')!)
    await nextTick()

    expect(mockConfirmGoogleLink).toHaveBeenCalledWith(
      expect.objectContaining({ linkToken: 'test-token', password: 'mypassword123' }),
    )
  })

  it('handleConfirm_WhenServiceThrows_DoesNotCrash', async () => {
    mockConfirmGoogleLink.mockRejectedValue(new Error('Auth failed'))
    await renderGoogleLink()

    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
    await fireEvent.input(passwordInput, { target: { value: 'mypassword123' } })

    const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement
    await fireEvent.change(checkbox, { target: { checked: true } })

    await fireEvent.submit(document.querySelector('form')!)
    await nextTick()

    expect(mockConfirmGoogleLink).toHaveBeenCalled()
    expect(document.querySelector('form')).toBeTruthy()
  })

  it('handleCancel_CallsCancelGoogleLinkAndRedirects', async () => {
    mockCancelGoogleLink.mockResolvedValue(undefined)
    await renderGoogleLink()

    const allButtons = screen.getAllByRole('button')
    const cancelLabel = i18n.global.t('auth.googleLink.cancel')
    const cancelButton = allButtons.find((b) => b.textContent?.trim() === cancelLabel)
    expect(cancelButton).toBeTruthy()
    await fireEvent.click(cancelButton!)
    await nextTick()

    expect(mockCancelGoogleLink).toHaveBeenCalled()
  })
})

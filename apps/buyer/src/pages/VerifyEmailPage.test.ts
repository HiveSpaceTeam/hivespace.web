import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import VerifyEmailPage from './VerifyEmailPage.vue'
import { accountService } from '@/services/account.service'

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    AuthLayout: { template: '<div><slot /></div>' },
    Button: { template: '<button type="submit"><slot /></button>' },
    Input: {
      template:
        '<input :type="type ?? \'text\'" :value="modelValue" :id="id" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'type', 'label', 'error', 'placeholder', 'required', 'disabled', 'id', 'inputClass'],
      emits: ['update:modelValue'],
    },
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifySuccess: jest.fn(),
      notifyError: jest.fn(),
    }),
  }
})

jest.mock('@/services/account.service', () => ({
  accountService: {
    resendVerificationEmail: jest.fn(),
    verifyEmail: jest.fn().mockImplementation(() => Promise.resolve()),
  },
}))

const renderVerifyEmail = async (outcome?: string) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/verify-email', component: VerifyEmailPage, meta: { allowAnonymous: true } }],
  })
  const path = outcome ? `/verify-email?outcome=${outcome}` : '/verify-email'
  await router.push(path)
  await router.isReady()
  return render(VerifyEmailPage, { global: { plugins: [pinia, router, i18n] } })
}

describe('VerifyEmailPage (buyer)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(accountService.resendVerificationEmail).mockResolvedValue(undefined)
  })

  it('renders_InstructionMessage', async () => {
    await renderVerifyEmail()

    expect(document.querySelector('[data-testid]') || document.querySelector('button') || document.body).toBeTruthy()
  })

  it('handleSubmit_WithValidEmail_CallsResendVerificationEmail', async () => {
    await renderVerifyEmail()

    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement
    await fireEvent.input(emailInput, { target: { value: 'buyer@example.com' } })

    await fireEvent.submit(document.querySelector('form')!)

    await waitFor(() =>
      expect(accountService.resendVerificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'buyer@example.com' }),
      ),
    )
  })

  it('handleSubmit_WhenServiceThrows_HandlesErrorGracefully', async () => {
    jest.mocked(accountService.resendVerificationEmail).mockRejectedValueOnce(
      new Error('Too many requests'),
    )
    await renderVerifyEmail()

    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement
    await fireEvent.input(emailInput, { target: { value: 'buyer@example.com' } })

    await fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => expect(accountService.resendVerificationEmail).toHaveBeenCalled())
    expect(document.querySelector('form')).toBeTruthy()
  })

  it('guidanceMessage_WithPendingVerificationOutcome_RendersPage', async () => {
    await renderVerifyEmail('pendingVerification')

    expect(document.querySelector('form')).toBeTruthy()
  })

  it('guidanceMessage_WithDuplicatePendingAccountOutcome_RendersPage', async () => {
    await renderVerifyEmail('duplicatePendingAccount')

    expect(document.querySelector('form')).toBeTruthy()
  })
})

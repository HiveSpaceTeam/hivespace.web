import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import ProfilePage from './ProfilePage.vue'
import { profileService } from '@/services/profile.service'
import { userService } from '@/services/user.service'

jest.mock('@/components/profile/ProfileSidebar.vue', () => ({
  default: { template: '<aside data-testid="profile-sidebar" />' },
}))

jest.mock('@/services/profile.service', () => ({
  profileService: { getMyProfile: jest.fn() },
}))

jest.mock('@/services/user.service', () => ({
  userService: { updateProfile: jest.fn() },
}))

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    Button: {
      template: '<button :type="type ?? \'button\'"><slot /></button>',
      props: ['type', 'loading', 'variant', 'disabled'],
    },
    Input: {
      template: '<input :value="modelValue" :disabled="disabled" />',
      props: ['modelValue', 'type', 'label', 'error', 'disabled'],
      emits: ['update:modelValue'],
    },
    Select: {
      template: '<select />',
      props: ['modelValue', 'options', 'placeholder'],
      emits: ['update:modelValue'],
    },
    RadioGroup: {
      template: '<div />',
      props: ['modelValue', 'options', 'direction', 'gapClass'],
      emits: ['update:modelValue'],
    },
    FileInput: {
      template: '<div data-testid="file-input" />',
      props: ['modelValue', 'buttonText', 'helpText', 'accept', 'maxSize', 'previewDirection',
              'previewShape', 'previewSize', 'previewSrc', 'avatarFallback', 'showFileName', 'error'],
      emits: ['update:modelValue', 'change', 'error'],
    },
    useAuth: () => ({
      currentUser: ref(null),
      getCurrentUser: jest.fn<() => Promise<null>>().mockResolvedValue(null),
      isLoading: ref(false),
    }),
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifyError: jest.fn(),
      notifySuccess: jest.fn(),
    }),
  }
})

const fakeProfile = {
  userName: 'testuser',
  fullName: 'Test User',
  phoneNumber: '0901234567',
  email: 'test@example.com',
  gender: 1,
  dateOfBirth: null,
  avatarUrl: null,
}

const renderProfile = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/profile', component: ProfilePage }],
  })
  await router.push('/profile')
  await router.isReady()

  return render(ProfilePage, { global: { plugins: [pinia, router, i18n] } })
}

describe('ProfilePage (buyer)', () => {
  beforeEach(() => {
    jest.mocked(profileService.getMyProfile).mockResolvedValue(fakeProfile)
    jest.mocked(userService.updateProfile).mockResolvedValue(undefined)
  })

  it('renders_ProfileFieldsFromStore', async () => {
    await renderProfile()

    expect(await screen.findByText(i18n.global.t('storefront.profilePage.title'))).toBeTruthy()
    expect(screen.getByText(i18n.global.t('storefront.profilePage.name'))).toBeTruthy()
    expect(screen.getByText(i18n.global.t('storefront.profilePage.email'))).toBeTruthy()
  })

  it('editForm_SubmitsToEndpoint', async () => {
    await renderProfile()

    await screen.findByText(i18n.global.t('storefront.profilePage.title'))

    await fireEvent.click(screen.getByText(i18n.global.t('storefront.profilePage.save')))

    await waitFor(() => {
      expect(jest.mocked(userService.updateProfile)).toHaveBeenCalledWith(
        expect.objectContaining({ userName: 'testuser' }),
      )
    })
  })
})

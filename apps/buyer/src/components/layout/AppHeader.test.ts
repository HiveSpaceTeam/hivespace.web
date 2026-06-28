import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { defineComponent, nextTick, ref } from 'vue'
import { render, waitFor } from '@testing-library/vue'
import AppHeader from './AppHeader.vue'

const currentUser = ref<{
  profile?: {
    username?: string
    name?: string
    email?: string
    picture?: string
    sub?: string
  }
} | null>(null)
const myProfile = ref<{ userName: string } | null>(null)

const mockPush = jest.fn<(path: string | { path: string; query?: Record<string, string> }) => void>()
const mockGetCurrentUser = jest.fn<() => Promise<typeof currentUser.value>>()
const mockLoadCurrentUserProfile = jest.fn<() => Promise<void>>()
const mockLogout = jest.fn<() => Promise<void>>()
const mockClearMyProfile = jest.fn<() => void>()

jest.mock('vue-router', () => {
  const vue = jest.requireActual<typeof import('vue')>('vue')

  return {
    useRouter: () => ({
      push: mockPush,
      currentRoute: vue.ref({ fullPath: '/' }),
    }),
  }
})

jest.mock('@/stores', () => ({
  useProfileStore: () => ({
    get myProfile() {
      return myProfile.value
    },
    clearMyProfile: mockClearMyProfile,
  }),
}))

jest.mock('lucide-vue-next', () => ({
  MoreVertical: defineComponent({
    template: '<span data-testid="more-vertical" />',
  }),
}))

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')

  return {
    ...actual,
    useAuth: () => ({
      currentUser,
      getCurrentUser: mockGetCurrentUser,
      logout: mockLogout,
    }),
    useAppShell: () => ({
      notifications: ref([]),
      unreadCount: ref(0),
      notificationLoading: ref(false),
      hasMore: ref(false),
      menuItems: [],
      markAsRead: jest.fn(),
      fetchNotifications: jest.fn(),
      loadMore: jest.fn(),
      currentUserDisplayName: ref(''),
      currentUserFullName: ref(''),
      currentUserEmail: ref(''),
      currentUserAvatarSrc: ref(''),
      loadCurrentUserProfile: mockLoadCurrentUserProfile,
      themeChange: jest.fn(),
      cultureChange: jest.fn(),
    }),
    HeaderLogo: defineComponent({
      template: '<div data-testid="header-logo" />',
    }),
    ThemeToggler: defineComponent({
      emits: ['theme-changed'],
      template: '<button type="button" data-testid="theme-toggler" />',
    }),
    LanguageSwitcher: defineComponent({
      emits: ['language-changed'],
      template: '<button type="button" data-testid="language-switcher" />',
    }),
    NotificationMenu: defineComponent({
      emits: ['notification-read', 'notification-clicked', 'open', 'filter-change', 'load-more', 'view-all'],
      template: '<div data-testid="notification-menu" />',
    }),
    UserMenu: defineComponent({
      emits: ['sign-out', 'navigate'],
      template: '<div data-testid="user-menu" />',
    }),
  }
})

const fakeUser = {
  profile: {
    username: 'buyer001',
    name: 'Buyer Test',
    email: 'buyer@example.test',
    picture: 'https://cdn.example.test/avatar.png',
    sub: 'user-123',
  },
}

const renderHeader = () =>
  render(AppHeader, {
    global: {
      mocks: {
        $t: (key: string) => key,
      },
    },
  })

describe('AppHeader (buyer)', () => {
  beforeEach(() => {
    currentUser.value = null
    myProfile.value = null
    mockGetCurrentUser.mockReset()
    mockGetCurrentUser.mockResolvedValue(currentUser.value)
    mockLoadCurrentUserProfile.mockReset()
    mockLoadCurrentUserProfile.mockResolvedValue(undefined)
    mockLogout.mockReset()
    mockLogout.mockResolvedValue(undefined)
    mockClearMyProfile.mockReset()
    mockPush.mockReset()
  })

  it('should skip profile load when the store already has profile data', async () => {
    currentUser.value = fakeUser
    myProfile.value = { userName: 'buyer001' }
    mockGetCurrentUser.mockResolvedValue(fakeUser)

    renderHeader()

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalledTimes(1)
    })
    await nextTick()

    expect(mockLoadCurrentUserProfile).not.toHaveBeenCalled()
  })

  it('should load profile data when the store profile is null', async () => {
    currentUser.value = fakeUser
    mockGetCurrentUser.mockResolvedValue(fakeUser)

    renderHeader()

    await waitFor(() => {
      expect(mockLoadCurrentUserProfile).toHaveBeenCalledTimes(1)
    })
  })

  it('should skip profile load when the user is unauthenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null)

    renderHeader()

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalledTimes(1)
    })
    await nextTick()

    expect(mockLoadCurrentUserProfile).not.toHaveBeenCalled()
  })

  it('should load profile data when the user signs in after mount', async () => {
    mockGetCurrentUser.mockResolvedValue(null)

    renderHeader()

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalledTimes(1)
    })

    currentUser.value = fakeUser
    await nextTick()

    await waitFor(() => {
      expect(mockLoadCurrentUserProfile).toHaveBeenCalledTimes(1)
    })
  })
})

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { render, screen } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import i18n from '@/i18n'
import BuyersPage from './BuyersPage.vue'

const formatMoneyMock = jest.fn()

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')

  return {
    ...actual,
    AppShell: { template: '<div><slot /></div>' },
    Button: {
      template: '<button type="button"><slot /></button>',
      props: ['variant', 'size', 'className'],
    },
    Input: {
      template: '<div><slot name="prepend" /><input /></div>',
      props: ['modelValue', 'type', 'placeholder', 'inputClass', 'class'],
    },
    PageBreadcrumb: {
      template: '<div><slot /></div>',
      props: ['pageTitle'],
    },
    Pagination: {
      template: '<div><slot name="summary" /></div>',
      props: ['currentPage', 'totalPages', 'pageSize', 'totalItems'],
    },
    Tabs: {
      template: '<div />',
      props: ['modelValue', 'options', 'variant', 'class'],
    },
    Badge: {
      template: '<span><slot /></span>',
      props: ['size', 'color', 'dot', 'dotColorClass'],
    },
    useMoneyFormatter: () => ({
      formatMoney: formatMoneyMock,
    }),
    useAppStore: () => ({
      notifyInfo: jest.fn(),
      notifySuccess: jest.fn(),
      notifyWarning: jest.fn(),
    }),
    useConfirmModal: () => ({
      openConfirmModal: jest.fn(),
    }),
  }
})

describe('BuyersPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    formatMoneyMock.mockReset()
    formatMoneyMock.mockImplementation((value: unknown) => {
      const { amount, issue } = value as {
        amount: number | null
        issue?: { placeholder?: string } | null
      }

      if (issue) {
        return issue.placeholder ?? 'Invalid money'
      }

      return amount === 1200000 ? '$12,000.00' : '₫18,450,000'
    })
  })

  it('should render money-bearing values with shared formatter rules', () => {
    render(BuyersPage, {
      global: {
        plugins: [i18n],
      },
    })

    expect(screen.getByText('$12,000.00')).toBeTruthy()
    expect(screen.getAllByText('₫18,450,000').length).toBeGreaterThan(0)
    expect(formatMoneyMock).toHaveBeenCalled()
  })

  it('should show invalid-money placeholder when backend marks a value invalid', () => {
    formatMoneyMock.mockImplementation((value: unknown) => {
      const { issue } = value as {
        issue?: { placeholder?: string } | null
      }

      return issue?.placeholder ?? 'Invalid money'
    })

    render(BuyersPage, {
      global: {
        plugins: [i18n],
      },
    })

    expect(screen.getAllByText('Invalid money').length).toBeGreaterThan(0)
  })
})

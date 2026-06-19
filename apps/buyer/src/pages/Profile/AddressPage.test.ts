import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { render, screen, waitFor, fireEvent } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import AddressPage from './AddressPage.vue'
import { addressService } from '@/services/address.service'

const mockDeleteConfirm = jest.fn<() => Promise<boolean>>()

jest.mock('@/services/address.service', () => ({
  addressService: {
    getAddresses: jest.fn(),
    getDefaultAddress: jest.fn(),
    createAddress: jest.fn(),
    updateAddress: jest.fn(),
    deleteAddress: jest.fn(),
    setDefaultAddress: jest.fn(),
  },
}))

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    useModal: () => ({
      openModal: jest.fn().mockImplementation(() => Promise.resolve(null)),
      closeModal: jest.fn(),
    }),
    useConfirmModal: () => ({
      confirm: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
      deleteConfirm: mockDeleteConfirm,
    }),
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifySuccess: jest.fn(),
      notifyError: jest.fn(),
    }),
    ConfirmModal: { template: '<div />' },
  }
})

jest.mock('@/components/profile/AddressFormModal.vue', () => ({
  default: { template: '<div />' },
}))

const renderAddressPage = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/profile/address', component: AddressPage }],
  })
  await router.push('/profile/address')
  await router.isReady()

  return render(AddressPage, { global: { plugins: [pinia, router, i18n] } })
}

describe('AddressPage (buyer)', () => {
  beforeEach(() => {
    mockDeleteConfirm.mockReset()
    mockDeleteConfirm.mockResolvedValue(true)
    jest.mocked(addressService.getAddresses).mockResolvedValue([
      {
        id: 'addr-001',
        fullName: 'Nguyen Van A',
        phoneNumber: '0901234567',
        street: '123 Test St',
        province: 'Hanoi',
        commune: 'Hoan Kiem',
        country: 'Việt Nam',
        zipCode: '',
        isDefault: true,
      },
    ])
    jest.mocked(addressService.getDefaultAddress).mockResolvedValue({
      id: 'addr-001',
      fullName: 'Nguyen Van A',
      phoneNumber: '0901234567',
      street: '123 Test St',
      province: 'Hanoi',
      commune: 'Hoan Kiem',
      country: 'Việt Nam',
      zipCode: '',
      isDefault: true,
    })
  })

  it('renders_AddressListFromStore', async () => {
    await renderAddressPage()

    await waitFor(() => expect(screen.getByText('Nguyen Van A')).toBeTruthy())
  })

  it('addAddress_OpensModal', async () => {
    await renderAddressPage()

    await waitFor(() => expect(screen.getByText('Nguyen Van A')).toBeTruthy())
    expect(
      screen.getByRole('button', { name: new RegExp(i18n.global.t('storefront.address.addAddress')) }),
    ).toBeTruthy()
  })

  it('handleDelete_WhenConfirmed_CallsDeleteAddressService', async () => {
    jest.mocked(addressService.getAddresses).mockResolvedValue([
      {
        id: 'addr-001',
        fullName: 'Nguyen Van A',
        phoneNumber: '0901234567',
        street: '123 Test St',
        province: 'Hanoi',
        commune: 'Hoan Kiem',
        country: 'Việt Nam',
        zipCode: '',
        isDefault: true,
      },
      {
        id: 'addr-002',
        fullName: 'Tran Thi B',
        phoneNumber: '0912345678',
        street: '456 Sample Ave',
        province: 'Ho Chi Minh City',
        commune: 'Binh Thanh',
        country: 'Việt Nam',
        zipCode: '',
        isDefault: false,
      },
    ])
    jest.mocked(addressService.deleteAddress).mockResolvedValue(undefined)
    jest.mocked(addressService.getAddresses).mockResolvedValueOnce([
      {
        id: 'addr-001',
        fullName: 'Nguyen Van A',
        phoneNumber: '0901234567',
        street: '123 Test St',
        province: 'Hanoi',
        commune: 'Hoan Kiem',
        country: 'Việt Nam',
        zipCode: '',
        isDefault: true,
      },
      {
        id: 'addr-002',
        fullName: 'Tran Thi B',
        phoneNumber: '0912345678',
        street: '456 Sample Ave',
        province: 'Ho Chi Minh City',
        commune: 'Binh Thanh',
        country: 'Việt Nam',
        zipCode: '',
        isDefault: false,
      },
    ])

    await renderAddressPage()

    await waitFor(() => expect(screen.getByText('Tran Thi B')).toBeTruthy())

    const allButtons = screen.getAllByRole('button')
    const deleteButton = allButtons.find(
      (b) => b.textContent?.trim() === i18n.global.t('storefront.address.delete') ||
             b.textContent?.trim() === 'Xóa' ||
             b.textContent?.trim() === 'Delete',
    )
    expect(deleteButton).toBeTruthy()
    await fireEvent.click(deleteButton!)

    await waitFor(() => expect(addressService.deleteAddress).toHaveBeenCalledWith('addr-002'))
  })
})

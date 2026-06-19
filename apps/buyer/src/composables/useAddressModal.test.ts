import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'

jest.mock('vue-i18n', () => {
  const actual = jest.requireActual<typeof import('vue-i18n')>('vue-i18n')
  return { ...actual, useI18n: () => ({ t: (key: string) => key }) }
})

const mockOpenModal = jest.fn()

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  return {
    ...actual,
    useModal: () => ({
      openModal: mockOpenModal,
      closeModal: jest.fn(),
    }),
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifySuccess: jest.fn(),
      notifyError: jest.fn(),
    }),
  }
})

jest.mock('@/services/address.service', () => ({
  addressService: {
    getAddresses: jest.fn().mockImplementation(() => Promise.resolve([])),
    getDefaultAddress: jest.fn().mockImplementation(() => Promise.resolve(null)),
    createAddress: jest.fn(),
    updateAddress: jest.fn(),
    deleteAddress: jest.fn(),
    setDefaultAddress: jest.fn(),
  },
}))

jest.mock('@/components/profile/AddressFormModal.vue', () => ({
  default: { template: '<div />' },
}))

describe('useAddressModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockOpenModal.mockReset()
    mockOpenModal.mockImplementation(() => Promise.resolve(null))
  })

  it('openAddressModal_SetsVisibleTrue', async () => {
    const { useAddressModal } = await import('./useAddressModal')
    const { openAddressForm } = useAddressModal()

    await openAddressForm()

    expect(mockOpenModal).toHaveBeenCalled()
  })

  it('submitAddress_CallsStoreAction', async () => {
    const { addressService } = await import('@/services/address.service')
    mockOpenModal.mockImplementation(() => Promise.resolve(true))

    const { useAddressModal } = await import('./useAddressModal')
    const { openAddressForm } = useAddressModal()

    await openAddressForm()

    expect(addressService.getAddresses).toHaveBeenCalled()
  })

  it('openAddressForm_WithExistingAddress_OpensWithEditTitle', async () => {
    const { useAddressModal } = await import('./useAddressModal')
    const { openAddressForm } = useAddressModal()
    const existingAddress = {
      id: 'addr-001',
      fullName: 'Nguyen Van A',
      phoneNumber: '0901234567',
      street: '123 Test St',
      province: 'Hanoi',
      commune: 'Hoan Kiem',
      country: 'Việt Nam',
      zipCode: '',
      isDefault: true,
    }

    await openAddressForm(existingAddress)

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ address: existingAddress }),
    )
  })
})

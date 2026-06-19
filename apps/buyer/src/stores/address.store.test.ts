import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { useAddressStore } from './address.store'
import { addressService } from '@/services/address.service'
import type { UserAddress } from '@/types'

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
    useAppStore: () => ({
      setLoading: jest.fn(),
      notifySuccess: jest.fn(),
      notifyError: jest.fn(),
    }),
  }
})

const fakeAddress = (overrides: Partial<UserAddress> = {}): UserAddress => ({
  id: 'addr-001',
  fullName: 'Nguyen Van A',
  phoneNumber: '0901234567',
  street: '123 Test St',
  province: 'Hanoi',
  commune: 'Hoan Kiem',
  country: 'Việt Nam',
  zipCode: '',
  isDefault: false,
  ...overrides,
})

describe('useAddressStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.mocked(addressService.getAddresses).mockResolvedValue([fakeAddress()])
    jest.mocked(addressService.createAddress).mockResolvedValue(
      fakeAddress({ id: 'addr-002', street: '456 New St' }),
    )
    jest.mocked(addressService.updateAddress).mockResolvedValue(undefined)
    jest.mocked(addressService.deleteAddress).mockResolvedValue(undefined)
    jest.mocked(addressService.setDefaultAddress).mockResolvedValue(undefined)
  })

  it('should load addresses from the API', async () => {
    const store = useAddressStore()

    await store.fetchAddresses()

    expect(addressService.getAddresses).toHaveBeenCalled()
    expect(store.addresses).toHaveLength(1)
    expect(store.addresses[0]?.id).toBe('addr-001')
  })

  it('should append new address to list after save', async () => {
    const store = useAddressStore()
    await store.fetchAddresses()

    await store.saveAddress({
      fullName: 'Nguyen Van B',
      phoneNumber: '0987654321',
      street: '456 New St',
      province: 'HCMC',
      commune: 'District 1',
      isDefault: false,
    })

    expect(addressService.createAddress).toHaveBeenCalled()
    expect(store.addresses).toHaveLength(2)
  })

  it('should update default flag when setting default address', async () => {
    jest.mocked(addressService.getAddresses).mockResolvedValue([
      fakeAddress({ id: 'addr-001', isDefault: false }),
      fakeAddress({ id: 'addr-002', isDefault: false }),
    ])
    const store = useAddressStore()
    await store.fetchAddresses()

    await store.setDefault('addr-001')

    expect(addressService.setDefaultAddress).toHaveBeenCalledWith('addr-001')
    expect(store.addresses.find(a => a.id === 'addr-001')?.isDefault).toBe(true)
    expect(store.addresses.find(a => a.id === 'addr-002')?.isDefault).toBe(false)
  })

  it('should remove address from list after delete', async () => {
    const store = useAddressStore()
    await store.fetchAddresses()

    await store.confirmDelete('addr-001')

    expect(addressService.deleteAddress).toHaveBeenCalledWith('addr-001')
    expect(store.addresses).toHaveLength(0)
  })

  it('should load and set default address', async () => {
    const defaultAddr = fakeAddress({ id: 'addr-001', isDefault: true })
    jest.mocked(addressService.getDefaultAddress).mockResolvedValue(defaultAddr)
    const store = useAddressStore()

    await store.fetchDefaultAddress()

    expect(addressService.getDefaultAddress).toHaveBeenCalled()
    expect(store.defaultAddress?.id).toBe('addr-001')
  })

  it('should silently ignore error when fetching default address fails', async () => {
    jest.mocked(addressService.getDefaultAddress).mockRejectedValue(new Error('Network error'))
    const store = useAddressStore()

    await expect(store.fetchDefaultAddress()).resolves.toBeUndefined()
    expect(store.defaultAddress).toBeNull()
  })

  it('should unset previous default when editing existing address as default', async () => {
    jest.mocked(addressService.getAddresses).mockResolvedValue([
      fakeAddress({ id: 'addr-001', isDefault: true }),
      fakeAddress({ id: 'addr-002', isDefault: false }),
    ])
    const store = useAddressStore()
    await store.fetchAddresses()

    await store.saveAddress(
      {
        fullName: 'Updated Name',
        phoneNumber: '0901234567',
        street: '789 Updated St',
        province: 'Hanoi',
        commune: 'Hoan Kiem',
        isDefault: true,
      },
      'addr-002',
    )

    expect(addressService.updateAddress).toHaveBeenCalledWith('addr-002', expect.any(Object))
    const updatedAddr = store.addresses.find(a => a.id === 'addr-002')
    expect(updatedAddr?.isDefault).toBe(true)
    const otherAddr = store.addresses.find(a => a.id === 'addr-001')
    expect(otherAddr?.isDefault).toBe(false)
    // Default address appears first due to sort
    expect(store.addresses[0]?.isDefault).toBe(true)
  })

  it('should update address in place when editing as non-default', async () => {
    jest.mocked(addressService.getAddresses).mockResolvedValue([
      fakeAddress({ id: 'addr-001', isDefault: false }),
    ])
    const store = useAddressStore()
    await store.fetchAddresses()

    await store.saveAddress(
      {
        fullName: 'Updated Name',
        phoneNumber: '0901234567',
        street: '789 Updated St',
        province: 'Hanoi',
        commune: 'Hoan Kiem',
        isDefault: false,
      },
      'addr-001',
    )

    expect(addressService.updateAddress).toHaveBeenCalledWith('addr-001', expect.any(Object))
    expect(store.addresses[0]?.fullName).toBe('Updated Name')
    expect(store.addresses).toHaveLength(1)
  })

  it('should unset previous default when creating new address as default', async () => {
    const existingDefault = fakeAddress({ id: 'addr-001', isDefault: true })
    jest.mocked(addressService.getAddresses).mockResolvedValue([existingDefault])
    jest.mocked(addressService.createAddress).mockResolvedValue(
      fakeAddress({ id: 'addr-new', isDefault: true }),
    )
    const store = useAddressStore()
    await store.fetchAddresses()

    await store.saveAddress({
      fullName: 'New Person',
      phoneNumber: '0987654321',
      street: '999 New St',
      province: 'HCMC',
      commune: 'District 1',
      isDefault: true,
    })

    const newAddr = store.addresses.find(a => a.id === 'addr-new')
    expect(newAddr?.isDefault).toBe(true)
    const oldAddr = store.addresses.find(a => a.id === 'addr-001')
    expect(oldAddr?.isDefault).toBe(false)
    expect(store.addresses[0]?.isDefault).toBe(true)
  })

  it('should append new non-default address to list', async () => {
    jest.mocked(addressService.createAddress).mockResolvedValue(
      fakeAddress({ id: 'addr-new', isDefault: false }),
    )
    const store = useAddressStore()
    await store.fetchAddresses()

    await store.saveAddress({
      fullName: 'New Person',
      phoneNumber: '0987654321',
      street: '999 New St',
      province: 'HCMC',
      commune: 'District 1',
      isDefault: false,
    })

    expect(store.addresses).toHaveLength(2)
    expect(store.addresses[1]?.id).toBe('addr-new')
  })

  it('should silently ignore error when set default fails', async () => {
    jest.mocked(addressService.setDefaultAddress).mockRejectedValue(new Error('Network error'))
    const store = useAddressStore()
    await store.fetchAddresses()

    await expect(store.setDefault('addr-001')).resolves.toBeUndefined()
  })
})

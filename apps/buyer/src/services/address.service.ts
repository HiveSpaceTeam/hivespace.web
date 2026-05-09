import { BaseService } from './base.service'
import type { UserAddress, AddressApiPayload } from '@/types'

class AddressService extends BaseService {
  getAddresses(): Promise<UserAddress[]> {
    return this.get<UserAddress[]>('/users/address')
  }

  getAddressById(id: string): Promise<UserAddress> {
    return this.get<UserAddress>(`/users/address/${id}`)
  }

  getDefaultAddress(): Promise<UserAddress> {
    return this.get<UserAddress>('/users/address/default')
  }

  getAddressDefault(): Promise<UserAddress> {
    return this.getDefaultAddress()
  }

  createAddress(data: AddressApiPayload): Promise<UserAddress> {
    return this.post<UserAddress>('/users/address', data)
  }

  updateAddress(id: string, data: AddressApiPayload): Promise<void> {
    return this.put<void>(`/users/address/${id}`, { ...data, id })
  }

  deleteAddress(id: string): Promise<void> {
    return this.delete<void>(`/users/address/${id}`)
  }

  setDefaultAddress(id: string): Promise<void> {
    return this.put<void>(`/users/address/${id}/default`, {})
  }
}

export const addressService = new AddressService()

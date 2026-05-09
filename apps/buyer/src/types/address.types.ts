// Matches API response from GET /api/v1/users/address
export interface UserAddress {
  id: string
  fullName: string
  phoneNumber: string
  street: string
  commune: string
  province: string
  country: string
  zipCode: string
  isDefault: boolean
}

// Used by AddressFormModal
export interface AddressFormData {
  fullName: string
  phoneNumber: string
  province: string
  commune: string
  street: string
  isDefault: boolean
}

export interface AddressApiPayload {
  fullName: string
  phoneNumber: string
  street: string
  commune: string
  province: string
  country: string
  zipCode: string
  isDefault: boolean
}

/** { province, commune } → "Hà Nội, Phường Dịch Vọng" */
export const formatLocation = (addr: Pick<UserAddress, 'province' | 'commune'>) =>
  [addr.province, addr.commune].filter(Boolean).join(', ')

/** { street, commune, province } → "123 Đường ABC, Phường Dịch Vọng, Hà Nội" */
export const formatFullAddress = (addr: Pick<UserAddress, 'street' | 'commune' | 'province'>) =>
  [addr.street, addr.commune, addr.province].filter(Boolean).join(', ')

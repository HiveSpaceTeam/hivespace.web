import { useModal } from '@hivespace/shared'
import { useAddressStore } from '@/stores'
import AddressFormModal from '@/components/profile/AddressFormModal.vue'
import type { UserAddress } from '@/types'

export const useAddressModal = () => {
  const { openModal } = useModal()
  const addressStore = useAddressStore()

  const openAddressForm = async (address?: UserAddress | null) => {
    const saved = await openModal(AddressFormModal, { raw: true, address })
    if (saved) await addressStore.fetchAddresses()
    return saved
  }

  return { openAddressForm }
}

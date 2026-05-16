import { useModal } from '@hivespace/shared'
import { useI18n } from 'vue-i18n'
import { useAddressStore } from '@/stores'
import AddressFormModal from '@/components/profile/AddressFormModal.vue'
import type { UserAddress } from '@/types'

export const useAddressModal = () => {
  const { openModal } = useModal()
  const { t } = useI18n()
  const addressStore = useAddressStore()

  const openAddressForm = async (address?: UserAddress | null) => {
    const saved = await openModal(AddressFormModal, {
      address,
      title: address
        ? t('storefront.address.modalEditTitle')
        : t('storefront.address.modalAddTitle'),
      maxWidth: '640px',
    })
    if (saved) await addressStore.fetchAddresses()
    return saved
  }

  return { openAddressForm }
}

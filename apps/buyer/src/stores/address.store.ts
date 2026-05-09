import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAppStore } from '@hivespace/shared'
import i18n from '@/i18n'
import { addressService } from '@/services/address.service'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { UserAddress, AddressFormData } from '@/types'

const sortAddresses = (list: UserAddress[]) =>
  [...list].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))

export const useAddressStore = defineStore('address', () => {
  const addresses = ref<UserAddress[]>([])
  const defaultAddress = ref<UserAddress | null>(null)
  const { isLoading, run } = useAsyncAction()

  const fetchAddresses = async () => {
    addresses.value = sortAddresses(await run(() => addressService.getAddresses()))
  }

  const fetchDefaultAddress = async () => {
    try {
      defaultAddress.value = await addressService.getDefaultAddress()
    } catch {
      // error toast handled by apiService
    }
  }

  const saveAddress = async (data: AddressFormData, editId?: string | null) => {
    const appStore = useAppStore()
    await run(async () => {
      const payload = {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        street: data.street,
        province: data.province,
        commune: data.commune,
        country: 'Việt Nam',
        zipCode: '',
        isDefault: data.isDefault,
      }

      if (editId) {
        await addressService.updateAddress(editId, payload)
        if (payload.isDefault) {
          addresses.value = sortAddresses(
            addresses.value.map(a =>
              a.id === editId ? { ...a, ...payload } : { ...a, isDefault: false },
            ),
          )
        } else {
          const idx = addresses.value.findIndex(a => a.id === editId)
          if (idx !== -1) addresses.value[idx] = { ...addresses.value[idx], ...payload }
        }
      } else {
        const created = await addressService.createAddress(payload)
        if (created.isDefault) {
          addresses.value = sortAddresses([
            ...addresses.value.map(a => ({ ...a, isDefault: false })),
            created,
          ])
        } else {
          addresses.value.push(created)
        }
      }

      appStore.notifySuccess(i18n.global.t('storefront.address.saveSuccess'))
    })
  }

  const confirmDelete = async (id: string) => {
    const appStore = useAppStore()
    await run(async () => {
      await addressService.deleteAddress(id)
      addresses.value = addresses.value.filter(a => a.id !== id)
      appStore.notifySuccess(i18n.global.t('storefront.address.deleteSuccess'))
    })
  }

  const setDefault = async (id: string) => {
    const appStore = useAppStore()
    try {
      await addressService.setDefaultAddress(id)
      addresses.value = sortAddresses(
        addresses.value.map(a => ({ ...a, isDefault: a.id === id })),
      )
      appStore.notifySuccess(i18n.global.t('storefront.address.setDefaultSuccess'))
    } catch {
      // error toast handled by apiService
    }
  }

  return {
    addresses,
    defaultAddress,
    isLoading,
    fetchAddresses,
    fetchDefaultAddress,
    saveAddress,
    confirmDelete,
    setDefault,
  }
})

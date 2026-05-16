<template>
  <div class="-mx-6 -mb-6">
    <form @submit.prevent="handleSubmit" class="px-6 pb-5 flex flex-col gap-4">
      <!-- Name + Phone row -->
      <div class="grid grid-cols-2 gap-3">
        <Input
          v-model="formData.fullName"
          :placeholder="$t('storefront.address.fullName')"
          :label="$t('storefront.address.fullName')"
          required
        />
        <Input
          v-model="formData.phoneNumber"
          :placeholder="$t('storefront.address.phone')"
          :label="$t('storefront.address.phone')"
          required
        />
      </div>

      <!-- Province / Commune -->
      <div class="grid grid-cols-2 gap-3">
        <Input
          v-model="formData.province"
          :placeholder="$t('storefront.address.province')"
          :label="$t('storefront.address.province')"
          required
        />
        <Input
          v-model="formData.commune"
          :placeholder="$t('storefront.address.commune')"
          :label="$t('storefront.address.commune')"
          required
        />
      </div>

      <!-- Street address -->
      <TextArea
        v-model="formData.street"
        :placeholder="$t('storefront.address.detailPlaceholder')"
        :label="$t('storefront.address.detail')"
        :rows="2"
        required
      />

      <!-- Set as default checkbox -->
      <label class="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          v-model="formData.isDefault"
          class="w-4 h-4 accent-primary rounded"
        />
        <span class="text-sm text-gray-700 dark:text-gray-300">
          {{ $t('storefront.address.setDefault') }}
        </span>
      </label>
    </form>

    <div class="flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 px-6 py-4">
      <Button type="button" variant="outline" :onClick="handleClose">
        {{ $t('storefront.address.cancel') }}
      </Button>
      <Button type="button" variant="primary" :loading="isLoading" :onClick="handleSubmit">
        {{ $t('storefront.address.confirm') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Input, TextArea, Button, useModal } from '@hivespace/shared'
import { storeToRefs } from 'pinia'
import { useAddressStore } from '@/stores'
import type { UserAddress, AddressFormData } from '@/types'

const props = defineProps<{ address?: UserAddress | null }>()

const { closeModal } = useModal()
const addressStore = useAddressStore()
const { isLoading } = storeToRefs(addressStore)

const formData = reactive<AddressFormData>({
  fullName: '',
  phoneNumber: '',
  province: '',
  commune: '',
  street: '',
  isDefault: false,
})

watch(() => props.address, (addr) => {
  formData.fullName    = addr?.fullName    ?? ''
  formData.phoneNumber = addr?.phoneNumber ?? ''
  formData.province    = addr?.province    ?? ''
  formData.commune     = addr?.commune     ?? ''
  formData.street      = addr?.street      ?? ''
  formData.isDefault   = addr?.isDefault   ?? false
}, { immediate: true })

const handleClose = () => closeModal(false)

const handleSubmit = async () => {
  if (!formData.fullName || !formData.phoneNumber || !formData.province || !formData.commune || !formData.street) return
  await addressStore.saveAddress({ ...formData }, props.address?.id)
  closeModal(true)
}
</script>

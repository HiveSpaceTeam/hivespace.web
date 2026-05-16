<template>
  <div class="-mx-6 -mb-6">
    <div class="px-6 pb-2 max-h-[55vh] overflow-y-auto">
      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <Spinner />
      </div>

      <!-- Empty -->
      <div v-else-if="addresses.length === 0"
        class="text-center py-8 text-sm text-gray-400">
        {{ t('checkout.noAddresses') }}
      </div>

      <!-- Address list -->
      <div v-else class="divide-y divide-gray-100 dark:divide-gray-700">
        <div
          v-for="addr in addresses"
          :key="addr.id"
          class="flex items-start gap-3 py-4 cursor-pointer"
          @click="selectedId = addr.id"
        >
          <!-- Radio bên trái -->
          <input
            type="radio"
            :value="addr.id"
            v-model="selectedId"
            class="mt-0.5 accent-primary shrink-0 cursor-pointer w-4 h-4"
            @click.stop
          />

          <!-- Nội dung giữa -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ addr.fullName }}</span>
              <span class="text-gray-300 dark:text-gray-600">|</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ addr.phoneNumber }}</span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              {{ formatFullAddress(addr) }}
            </p>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <Badge v-if="addr.isDefault" variant="light" size="sm" color="error">
                {{ t('checkout.defaultAddress') }}
              </Badge>
            </div>
          </div>

          <!-- Nút Edit bên phải -->
          <button
            type="button"
            @click.stop="handleEdit(addr)"
            class="text-primary text-sm hover:underline shrink-0 mt-0.5"
          >
            {{ t('storefront.address.update') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Footer: Thêm địa chỉ mới + Hủy + Xác nhận -->
    <div class="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 px-6 py-4">
      <button
        type="button"
        @click="handleAddNew"
        class="flex items-center gap-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded transition-colors"
      >
        <Plus class="w-4 h-4" />
        {{ t('checkout.addNewAddress') }}
      </button>
      <div class="flex gap-3">
        <Button type="button" variant="outline" @click="closeModal(null)">
          {{ t('storefront.address.cancel') }}
        </Button>
        <Button type="button" variant="primary" :disabled="!selectedId" @click="handleConfirm">
          {{ t('checkout.confirmAddress') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { Button, Badge, Spinner, useModal } from '@hivespace/shared'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useAddressStore } from '@/stores'
import { useAddressModal } from '@/composables/useAddressModal'
import { formatFullAddress } from '@/types'
import type { UserAddress } from '@/types'

const props = defineProps<{ currentAddressId?: string | null }>()

const { t } = useI18n()
const { closeModal } = useModal()
const addressStore = useAddressStore()
const { addresses, isLoading } = storeToRefs(addressStore)
const { openAddressForm } = useAddressModal()

const selectedId = ref<string | null>(props.currentAddressId ?? null)

onMounted(() => addressStore.fetchAddresses())

const handleEdit = async (addr: UserAddress) => {
  await openAddressForm(addr)
}

const handleAddNew = async () => {
  await openAddressForm()
  if (!selectedId.value) {
    const def = addresses.value.find(a => a.isDefault)
    if (def) selectedId.value = def.id
  }
}

const handleConfirm = () => {
  const addr = addresses.value.find(a => a.id === selectedId.value)
  closeModal(addr ?? null)
}
</script>

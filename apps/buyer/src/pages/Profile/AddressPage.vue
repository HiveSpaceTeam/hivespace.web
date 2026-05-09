<template>
  <div class="min-h-screen bg-[#f5f5f5] dark:bg-surface-dark py-6">
    <div class="container mx-auto px-4">
      <div class="flex gap-4 items-start">

        <ProfileSidebar />

        <!-- Main content -->
        <div class="flex-1 bg-white dark:bg-card-dark rounded shadow-sm">
          <!-- Header -->
          <div class="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-gray-700">
            <h1 class="text-lg font-medium text-gray-800 dark:text-gray-100">
              {{ $t('storefront.address.pageTitle') }}
            </h1>
            <Button variant="outline" size="sm" :startIcon="PlusIcon" :onClick="() => openAddressForm()">
              {{ $t('storefront.address.addAddress') }}
            </Button>
          </div>

          <!-- Address list -->
          <div class="px-8 py-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              {{ $t('storefront.address.pageTitle') }}
            </p>

            <div v-for="(addr, idx) in addresses" :key="addr.id">
              <div v-if="idx > 0" class="border-t border-gray-100 dark:border-gray-700 my-1" />

              <div class="py-4">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-medium text-sm text-gray-800 dark:text-gray-100">
                        {{ addr.fullName }}
                      </span>
                      <span class="text-gray-300 dark:text-gray-600">|</span>
                      <span class="text-sm text-gray-500 dark:text-gray-400">{{ addr.phoneNumber }}</span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                      {{ addr.street }}<br />
                      {{ formatLocation(addr) }}
                    </p>
                    <div class="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge v-if="addr.isDefault" variant="solid" color="error" size="sm">
                        {{ $t('storefront.address.defaultBadge') }}
                      </Badge>
                    </div>
                  </div>

                  <div class="flex flex-col items-end gap-2 shrink-0">
                    <div class="flex items-center gap-3">
                      <button
                        type="button"
                        @click="openAddressForm(addr)"
                        class="text-primary text-xs hover:underline cursor-pointer"
                      >
                        {{ $t('storefront.address.update') }}
                      </button>
                      <button
                        v-if="!addr.isDefault"
                        type="button"
                        @click="handleDelete(addr.id)"
                        class="text-primary text-xs hover:underline cursor-pointer"
                      >
                        {{ $t('storefront.address.delete') }}
                      </button>
                    </div>
                    <button
                      v-if="!addr.isDefault"
                      type="button"
                      @click="addressStore.setDefault(addr.id)"
                      class="text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1 rounded hover:border-gray-400 transition-colors"
                    >
                      {{ $t('storefront.address.setDefault') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="addresses.length === 0" class="py-16 text-center text-sm text-gray-400">
              {{ $t('storefront.address.emptyAddresses') }}
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Badge, Button, useConfirmModal } from '@hivespace/shared'
import { storeToRefs } from 'pinia'
import { Plus as PlusIcon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useAddressStore } from '@/stores'
import { useAddressModal } from '@/composables/useAddressModal'
import ProfileSidebar from '@/components/profile/ProfileSidebar.vue'
import { formatLocation } from '@/types'

const { t } = useI18n()
const { deleteConfirm } = useConfirmModal()
const addressStore = useAddressStore()
const { addresses } = storeToRefs(addressStore)
const { openAddressForm } = useAddressModal()

const handleDelete = async (id: string) => {
  const ok = await deleteConfirm(t('storefront.address.deleteConfirmMessage'))
  if (ok) await addressStore.confirmDelete(id)
}

onMounted(() => addressStore.fetchAddresses())
</script>

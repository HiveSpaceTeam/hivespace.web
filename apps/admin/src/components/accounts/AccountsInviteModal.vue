<template>
  <div class="-mx-6 -mb-6">
    <div class="px-6 pb-6">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          v-model="form.name"
          placeholder="Nguyễn Văn A"
          :label="t('accounts.inviteModal.fullName')"
        />
        <Input
          v-model="form.email"
          placeholder="vana@hivespace.vn"
          :label="t('accounts.inviteModal.workEmail')"
        />
        <Select v-model="form.roleId" :options="roleOptions" :label="t('accounts.inviteModal.role')" />
        <Select
          v-model="form.expiry"
          :options="expiryOptions"
          :label="t('accounts.inviteModal.inviteExpires')"
        />
      </div>
    </div>
    <div class="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
      <Button variant="outline" size="sm" @click="closeModal(null)">
        {{ t('accounts.inviteModal.cancel') }}
      </Button>
      <Button size="sm" @click="handleSubmit">
        {{ t('accounts.inviteModal.sendInvitation') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Button, Input, Select, useModal } from '@hivespace/shared'
import { useI18n } from 'vue-i18n'

type RoleId = 'superadmin' | 'admin' | 'finance' | 'compliance' | 'risk' | 'support'

interface InviteModalResult {
  name: string
  email: string
  roleId: RoleId
  expiry: string
}

defineProps<{
  roleOptions: { value: string; label: string }[]
  expiryOptions: { value: string; label: string }[]
}>()

const { closeModal } = useModal()
const { t } = useI18n()

const form = reactive<InviteModalResult>({
  name: '',
  email: '',
  roleId: 'support',
  expiry: '3d',
})

const handleSubmit = () => {
  closeModal<InviteModalResult>({
    name: form.name.trim() || t('accounts.inviteModal.newUserDefault'),
    email: form.email.trim() || t('accounts.inviteModal.newUserEmailDefault'),
    roleId: form.roleId,
    expiry: form.expiry,
  })
}
</script>

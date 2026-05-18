<template>
  <div class="min-h-screen bg-[#f5f5f5] dark:bg-surface-dark py-6">
    <div class="container mx-auto px-4">
      <div class="flex gap-4 items-start">

        <ProfileSidebar />

        <!-- Main content -->
        <div class="flex-1 bg-white dark:bg-card-dark rounded shadow-sm">
          <!-- Header -->
          <div class="px-8 py-5 border-b border-gray-100 dark:border-gray-700">
            <h1 class="text-lg font-medium text-gray-800 dark:text-gray-100">
              {{ $t('storefront.profilePage.title') }}
            </h1>
            <p class="text-sm text-gray-400 mt-0.5">
              {{ $t('storefront.profilePage.subtitle') }}
            </p>
          </div>

          <!-- Form area -->
          <div class="flex px-8 py-8 gap-10">

            <!-- Left: form fields -->
            <form class="flex-1 flex flex-col gap-5" @submit.prevent="handleSave">

              <!-- Username (readonly) -->
              <div class="flex items-center">
                <span class="w-36 text-right pr-5 text-sm text-gray-500 dark:text-gray-400 shrink-0">
                  {{ $t('storefront.profilePage.username') }}
                </span>
                <div class="flex-1 max-w-xs">
                  <Input :modelValue="displayUsername" disabled />
                </div>
              </div>

              <!-- Name -->
              <div class="flex items-center">
                <span class="w-36 text-right pr-5 text-sm text-gray-500 dark:text-gray-400 shrink-0">
                  {{ $t('storefront.profilePage.name') }}
                </span>
                <div class="flex-1 max-w-xs">
                  <Input v-model="form.name" />
                </div>
              </div>

              <!-- Email -->
              <div class="flex items-center">
                <span class="w-36 text-right pr-5 text-sm text-gray-500 dark:text-gray-400 shrink-0">
                  {{ $t('storefront.profilePage.email') }}
                </span>
                <span class="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  {{ maskedEmail }}
                  <button type="button" class="text-primary text-xs hover:underline cursor-pointer">
                    {{ $t('storefront.profilePage.change') }}
                  </button>
                </span>
              </div>

              <!-- Phone -->
              <div class="flex items-center">
                <span class="w-36 text-right pr-5 text-sm text-gray-500 dark:text-gray-400 shrink-0">
                  {{ $t('storefront.profilePage.phone') }}
                </span>
                <span class="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  {{ maskedPhone }}
                  <button type="button" class="text-primary text-xs hover:underline cursor-pointer">
                    {{ $t('storefront.profilePage.change') }}
                  </button>
                </span>
              </div>

              <!-- Gender -->
              <div class="flex items-center">
                <span class="w-36 text-right pr-5 text-sm text-gray-500 dark:text-gray-400 shrink-0">
                  {{ $t('storefront.profilePage.gender') }}
                </span>
                <RadioGroup
                  v-model="form.gender"
                  :options="genderOptions"
                  direction="horizontal"
                  gapClass="gap-5"
                />
              </div>

              <!-- Date of birth -->
              <div class="flex items-center">
                <span class="w-36 text-right pr-5 text-sm text-gray-500 dark:text-gray-400 shrink-0">
                  {{ $t('storefront.profilePage.dob') }}
                </span>
                <div class="flex items-center gap-2">
                  <div class="w-28">
                    <Select
                      v-model="form.birthDay"
                      :options="dayOptions"
                      :placeholder="$t('storefront.profilePage.day')"
                    />
                  </div>
                  <div class="w-28">
                    <Select
                      v-model="form.birthMonth"
                      :options="monthOptions"
                      :placeholder="$t('storefront.profilePage.month')"
                    />
                  </div>
                  <div class="w-28">
                    <Select
                      v-model="form.birthYear"
                      :options="yearOptions"
                      :placeholder="$t('storefront.profilePage.year')"
                    />
                  </div>
                </div>
              </div>

              <!-- Save -->
              <div class="flex items-center mt-2">
                <div class="w-36 shrink-0"></div>
                <Button type="submit" variant="primary" :loading="isLoading">
                  {{ $t('storefront.profilePage.save') }}
                </Button>
              </div>
            </form>

            <!-- Right: avatar upload -->
            <div class="flex flex-col items-center pt-2 border-l border-gray-100 dark:border-gray-700 pl-10">
              <FileInput
                :key="avatarInputKey"
                v-model="avatarFile"
                :buttonText="$t('storefront.profilePage.choosePhoto')"
                :helpText="photoHelpText"
                accept="image/jpeg,image/png,image/webp"
                :maxSize="5242880"
                previewDirection="top"
                previewShape="circle"
                previewSize="lg"
                :previewSrc="profile?.avatarUrl"
                :avatarFallback="true"
                :showFileName="false"
                :error="avatarError"
                @change="handleAvatarChange"
                @error="handleAvatarError"
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuth, Button, Input, Select, RadioGroup, FileInput } from '@hivespace/shared'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useProfileStore } from '@/stores'
import ProfileSidebar from '@/components/profile/ProfileSidebar.vue'

const { currentUser } = useAuth()
const profileStore = useProfileStore()
const { profile, form, isLoading, avatarError } = storeToRefs(profileStore)
const { t } = useI18n()

const avatarFile = ref<File | null>(null)
const avatarInputKey = ref(0)

const displayUsername = computed(() =>
  currentUser.value?.profile?.preferred_username
  ?? currentUser.value?.profile?.name
  ?? currentUser.value?.profile?.sub
  ?? profile.value?.userName
  ?? ''
)

const maskedEmail = computed(() => {
  const email = profile.value?.email ?? ''
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 4))}@${domain}`
})

const maskedPhone = computed(() => {
  const phone = profile.value?.phoneNumber ?? ''
  if (!phone) return ''
  return `${'*'.repeat(Math.max(phone.length - 2, 6))}${phone.slice(-2)}`
})

const genderOptions = computed(() => [
  { value: 'male', label: t('storefront.profilePage.genderMale') },
  { value: 'female', label: t('storefront.profilePage.genderFemale') },
  { value: 'other', label: t('storefront.profilePage.genderOther') },
])

const dayOptions = Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: String(i + 1) }))
const monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1) }))
const yearOptions = computed(() => {
  const current = new Date().getFullYear()
  return Array.from({ length: 100 }, (_, i) => ({ value: current - i, label: String(current - i) }))
})

const photoHelpText = computed(() =>
  `${t('storefront.profilePage.photoMaxSize')} · ${t('storefront.profilePage.photoFormat')}`
)

onMounted(() => profileStore.fetchProfile())

const handleSave = async () => {
  const saved = await profileStore.saveProfile(avatarFile.value)

  if (saved) {
    avatarFile.value = null
    avatarInputKey.value += 1
  }
}

const handleAvatarChange = (file: File | null) => {
  avatarFile.value = file
  profileStore.clearAvatarError()
}

const handleAvatarError = (message: string) => {
  profileStore.setAvatarError(message, true)
}
</script>

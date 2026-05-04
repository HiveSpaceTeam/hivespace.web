<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="flex-1 min-h-0 flex flex-col">
      <ComponentCard :title="$t('pages.listOfAdmins')" fullHeight>
        <!-- Table Content -->
        <div class="flex-1 min-h-0 flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <!-- Search and Filter Controls -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <!-- Search Input -->
              <div class="flex items-center justify-end gap-2">
                <div class="w-full sm:w-64">
                  <Input type="text" :value="searchQuery" @input="tableHandleSearchInput"
                    :placeholder="$t('admins.searchPlaceholder')" autocomplete="off" />
                </div>

                <!-- Status Filter -->
                <div class="sm:w-48">
                  <Select v-model="statusFilter" :options="statusOptions" />
                </div>

                <!-- Admin Type Filter -->
                <div class="sm:w-48" v-if="currentUser?.isSystemAdmin()">
                  <Select v-model="adminTypeFilter" :options="adminTypeOptions" />
                </div>
              </div>

              <div class="flex items-center justify-end">
                <div class="flex items-center gap-2">
                  <Button :onClick="openAddAdminModal" :startIcon="BigPlusIcon" variant="primary">
                    {{ $t('admins.addNewAdmin') }}
                  </Button>
                  <Button :startIcon="RefreshIcon" variant="outline" @click="refreshAdmins">
                    {{ $t('common.actions.refresh') }}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="appStore.isLoading" class="p-8 text-center">
            <Spinner />
            <p class="mt-2 text-gray-600 dark:text-gray-400">{{ $t('admins.loading') }}</p>
          </div>

          <!-- Table -->
          <div v-else class="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <table class="w-full">
              <thead class="sticky top-0 z-10 bg-white dark:bg-gray-900">
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="px-3 py-3 text-left sm:px-4">
                    <button @click="handleSort('email')"
                      class="flex items-center gap-1 font-medium text-gray-500 text-theme-xs dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      {{ $t('admins.emailAddress') }}
                      <component :is="getSortIcon('email')" class="w-4 h-4 text-gray-500" />
                    </button>
                  </th>
                  <th class="px-3 py-3 text-left sm:px-4">
                    <button @click="handleSort('fullName')"
                      class="flex items-center gap-1 font-medium text-gray-500 text-theme-xs dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      {{ $t('admins.fullName') }}
                      <component :is="getSortIcon('fullName')" class="w-4 h-4 text-gray-500" />
                    </button>
                  </th>
                  <th class="px-3 py-3 text-left sm:px-4">
                    <button @click="handleSort('status')"
                      class="flex items-center gap-1 font-medium text-gray-500 text-theme-xs dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      {{ $t('admins.status') }}
                      <component :is="getSortIcon('status')" class="w-4 h-4 text-gray-500" />
                    </button>
                  </th>
                  <th class="px-3 py-3 text-center sm:px-4" v-if="currentUser?.isSystemAdmin()">
                    <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      {{ $t('admins.isSystemAdmin') }}
                    </p>
                  </th>
                  <th class="px-3 py-3 text-left sm:px-4">
                    <button @click="handleSort('createdAt')"
                      class="flex items-center gap-1 font-medium text-gray-500 text-theme-xs dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      {{ $t('admins.createdDate') }}
                      <component :is="getSortIcon('createdAt')" class="w-4 h-4 text-gray-500" />
                    </button>
                  </th>
                  <th class="px-3 py-3 text-left sm:px-4">
                    <button @click="handleSort('lastLoginAt')"
                      class="flex items-center gap-1 font-medium text-gray-500 text-theme-xs dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      {{ $t('admins.lastLoginDate') }}
                      <component :is="getSortIcon('lastLoginAt')" class="w-4 h-4 text-gray-500" />
                    </button>
                  </th>
                  <th class="px-3 py-3 text-left sm:px-4">
                    <button @click="handleSort('updatedAt')"
                      class="flex items-center gap-1 font-medium text-gray-500 text-theme-xs dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      {{ $t('admins.lastUpdatedDate') }}
                      <component :is="getSortIcon('updatedAt')" class="w-4 h-4 text-gray-500" />
                    </button>
                  </th>
                  <th class="px-3 py-3 text-center sm:px-4">
                    <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      {{ $t('admins.actionsColumn') }}
                    </p>
                  </th>
                </tr>
              </thead>
              <tbody style="min-height: 300px">
                <!-- Empty state row when no data -->
                <tr v-if="admins.length === 0">
                  <td :colspan="currentUser?.isSystemAdmin() ? 8 : 7" class="px-5 py-12 text-center">
                    <div class="text-gray-500 dark:text-gray-400">
                      <p class="text-lg font-medium">{{ $t('admins.noAdminsFound') }}</p>
                      <p class="text-sm mt-2">{{ $t('admins.noAdminsFoundDescription') }}</p>
                    </div>
                  </td>
                </tr>
                <tr v-for="(admin, index) in admins" :key="admin.id"
                  class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5">
                  <!-- Email Address -->
                  <td class="px-3 py-3 sm:px-4">
                    <div class="flex items-center">
                      <div class="shrink-0 h-10 w-10">
                        <img class="h-10 w-10 rounded-full object-cover"
                          :src="admin.avatarUrl || `/images/user/user-0${(index % 9) + 1}.jpg`" :alt="admin.email"
                          loading="lazy" />
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ admin.email }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Full Name -->
                  <td class="px-3 py-3 sm:px-4">
                    <div class="text-sm text-gray-900 dark:text-white">{{ admin.fullName }}</div>
                  </td>

                  <!-- Status -->
                  <td class="px-3 py-3 sm:px-4">
                    <Badge :size="'sm'" :color="isAdminActive(admin) ? 'success' : 'error'">
                      {{
                        isAdminActive(admin)
                          ? t('admins.values.status.active')
                          : t('admins.values.status.inactive')
                      }}
                    </Badge>
                  </td>

                  <!-- Is System Admin -->
                  <td class="px-3 py-3 sm:px-4" v-if="currentUser?.isSystemAdmin()">
                    <div class="flex items-center justify-center">
                      <svg v-if="admin.isSystemAdmin" class="w-5 h-5 text-green-500" fill="currentColor"
                        viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"></path>
                      </svg>
                    </div>
                  </td>

                  <!-- Created Date (field: createdAt) -->
                  <td class="px-3 py-3 sm:px-4">
                    <div class="text-sm text-gray-900 dark:text-white">
                      {{ formatDateTime(admin.createdAt) }}
                    </div>
                  </td>

                  <!-- Last Login Date (field: lastLoginAt) -->
                  <td class="px-3 py-3 sm:px-4">
                    <div class="text-sm text-gray-900 dark:text-white">
                      {{ formatDateTime(admin.lastLoginAt) }}
                    </div>
                  </td>

                  <!-- Last Updated Date (field: updatedAt) -->
                  <td class="px-3 py-3 sm:px-4">
                    <div class="text-sm text-gray-900 dark:text-white">
                      {{ formatDateTime(admin.updatedAt) }}
                    </div>
                  </td>

                  <!-- Actions -->
                  <td class="px-3 py-3 sm:px-4 text-center">
                    <DropdownMenu>
                      <template #icon>
                        <HorizontalDots />
                      </template>

                      <template #menu>
                        <button @click="tableHandleDelete(admin)"
                          class="flex items-center w-full px-3 py-2 text-sm text-red-700 hover:bg-gray-50 focus:outline-none focus:ring-0 active:outline-none dark:text-red-400 dark:hover:bg-gray-600">
                          <TrashRedIcon />
                          {{ actionText.delete }}
                        </button>

                        <button @click="tableHandleToggleStatus(admin)"
                          class="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-0 active:outline-none dark:text-gray-300 dark:hover:bg-gray-700">
                          <ToggleOffIcon v-if="isAdminActive(admin)" />
                          <ToggleOnIcon v-else />
                          {{ isAdminActive(admin) ? actionText.deactivate : actionText.activate }}
                        </button>
                      </template>
                    </DropdownMenu>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-4 shrink-0">
          <div class="flex justify-end text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>{{ $t('admins.lastUpdated') }} {{ lastUpdated }}</span>
          </div>
          
          <!-- Pagination -->
          <div class="border-t border-gray-200 pt-4 dark:border-gray-700" v-if="pagination">
            <Pagination
              :currentPage="pagination.currentPage"
              :totalPages="pagination.totalPages"
              :pageSize="pagination.pageSize"
              :totalItems="pagination.totalItems"
              @pageChange="onPageChange"
              @pageSizeChange="onPageSizeChange"
            >
              <template #summary>
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {{ $t('admins.showingResults', { count: filteredAdminsCount, total: pagination?.totalItems ?? admins.length }) }}
                </div>
              </template>
            </Pagination>
          </div>
        </div>
      </ComponentCard>
    </div>

    <!-- Add Admin Modal moved to global modal system -->
  </AppShell>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { AppShell } from '@hivespace/shared'
import {
  BigPlusIcon,
  PageBreadcrumb,
  ComponentCard,
  Button,
  Select,
  DropdownMenu,
  HorizontalDots,
  Badge,
  Input,
  Pagination,
  RefreshIcon,
  SortAscIcon,
  SortDescIcon,
  SortIcon,
  Spinner,
  ToggleOffIcon,
  ToggleOnIcon,
  TrashRedIcon,
  type AppUser,
} from '@hivespace/shared'
import { useModal, useConfirmModal, useFormatDate, useDebounce } from '@hivespace/shared'
import { useAppStore } from '@hivespace/shared'
import AdminDetailModal from './Popups/AdminDetailModal.vue'
import { useAdminStore } from '@/stores/admin.store'
import type { Admin, GetAdminListQuery } from '@/types'
import { RoleFilter, StatusFilter, Status } from '@/types'
import { watch } from 'vue'
import { useAuth } from '@hivespace/shared'
// Local params for server queries
import { storeToRefs } from 'pinia'

const { getCurrentUser } = useAuth()
const { t } = useI18n()
const appStore = useAppStore()
const adminStore = useAdminStore()

const currentPageTitle = computed(() => t('pages.adminManagement'))

// Options for the filter selects (i18n-backed)
const statusOptions = computed(() => [
  { value: StatusFilter.All, label: t('admins.allStatus') },
  { value: StatusFilter.Inactive, label: t('admins.inactive') },
  { value: StatusFilter.Active, label: t('admins.active') },
])

const adminTypeOptions = computed(() => [
  { value: RoleFilter.All, label: t('admins.allAdmins') },
  { value: RoleFilter.RegularAdmin, label: t('admins.regularAdmin') },
  { value: RoleFilter.SystemAdmin, label: t('admins.systemAdmin') },
])

// State management
const searchQuery = ref('')
const statusFilter = ref<StatusFilter>(StatusFilter.All)
const adminTypeFilter = ref<RoleFilter>(RoleFilter.All)
const lastUpdated = ref('')

// Sorting state
const currentSort = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

// Global modal handlers
const { openModal } = useModal()
const { deleteConfirm } = useConfirmModal()

// Current User (simulate current admin user)

const currentUser = ref<AppUser | null>(null)

// Sorting functions
const handleSort = (field: string) => {
  if (currentSort.value === field) {
    // Same field: cycle through asc -> desc -> none
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
    } else if (sortDirection.value === 'desc') {
      currentSort.value = null
      sortDirection.value = null
    } else {
      sortDirection.value = 'asc'
    }
  } else {
    // Different field: start with asc
    currentSort.value = field
    sortDirection.value = 'asc'
  }

  // Trigger refresh with new sort params
  loadAdmins({ page: 1 })
}

const getSortIcon = (field: string) => {
  if (currentSort.value !== field) return SortIcon
  return sortDirection.value === 'asc' ? SortAscIcon : SortDescIcon
}

const getSortParam = () => {
  if (!currentSort.value || !sortDirection.value) return undefined
  return `${currentSort.value}.${sortDirection.value}`
}

const params = ref<Partial<GetAdminListQuery>>({ page: 1, pageSize: 10 })

// Admin list from the store with proper reactivity
const { admins, pagination } = storeToRefs(adminStore)

// Use admins directly in template instead of filteredAdmins
const filteredAdminsCount = computed(() => admins.value.length)
// Load admins from server using current filters
const { formatDateTime, formatNow } = useFormatDate()
const { debounce } = useDebounce()
const loadAdmins = async (paramsOverride?: Partial<GetAdminListQuery>) => {
  try {
    // Merge overrides into local params
    if (paramsOverride) params.value = { ...(params.value || {}), ...paramsOverride }

    const mapped: GetAdminListQuery = {
      page: params.value?.page ?? 1,
      pageSize: params.value?.pageSize ?? 10,
      status: statusFilter.value,
      role: adminTypeFilter.value,
      searchTerm: (params.value?.searchTerm ?? searchQuery.value) || undefined,
      sort: params.value?.sort ?? getSortParam(),
    }

    await adminStore.fetchAdmins(mapped)
  } catch (err) {
    console.error('Failed to load admins:', err)
    appStore.notifyError(
      t('admins.notifications.loadFailed.title'),
      t('admins.notifications.loadFailed.message'),
    )
  }
}

// Debounced search input handler will call loadAdmins (via composable)
const tableHandleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
  // keep the search term in params and trigger a debounced load
  params.value.searchTerm = searchQuery.value
  debounce('admins-search', () => void loadAdmins({ page: 1 }), 400)
}

// Pagination Event Handlers
const onPageChange = (page: number) => {
  loadAdmins({ page })
}

const onPageSizeChange = (pageSize: number) => {
  // when changing page size, reset to page 1
  loadAdmins({ page: 1, pageSize })
}

// Watch filters and reload when they change
watch(statusFilter, () => {
  loadAdmins({ page: 1 })
})
watch(adminTypeFilter, () => {
  loadAdmins({ page: 1 })
})

const actionText = {
  delete: t('admins.delete'),
  activate: t('admins.activate'),
  deactivate: t('admins.deactivate'),
}

// Helper to centralize active-status checks
const isAdminActive = (admin: Admin) => {
  // Admin.status matches the backend numeric status; treat `Status.Active` as active
  return admin?.status === Status.Active
}

// Shared formatter uses Vietnam locale/timezone defaults for business timestamps.

const tableHandleDelete = async (admin: Admin) => {
  const confirmed = await deleteConfirm(
    t('admins.actions.deleteAdmin.title'),
    t('admins.actions.deleteAdmin.message', { email: admin.email }),
  )

  if (confirmed) {
    handleDeleteAdmin(admin.id)
  }
}

const tableHandleToggleStatus = (admin: Admin) => {
  handleToggleStatus(admin)
}

// Event handlers
const handleDeleteAdmin = async (adminId: string) => {
  try {
    await adminStore.deleteUser(adminId)
    updateLastUpdated()
    appStore.notifySuccess(
      t('admins.notifications.deleteSuccess.title'),
      t('admins.notifications.deleteSuccess.message'),
    )
    console.log('Admin deleted:', adminId)
  } catch (err) {
    console.error('Failed to delete admin:', err)
    appStore.notifyError(
      t('admins.notifications.deleteFailed.title'),
      t('admins.notifications.deleteFailed.message'),
    )
  }
}

const handleToggleStatus = async (admin: Admin) => {
  const nextStatusText = isAdminActive(admin)
    ? t('admins.values.status.inactive')
    : t('admins.values.status.active')
  try {
    await adminStore.toggleAdminStatus(admin.id)
    updateLastUpdated()
    appStore.notifySuccess(
      t('admins.notifications.statusUpdateSuccess.title'),
      t('admins.notifications.statusUpdateSuccess.message', {
        email: admin.email,
        status: nextStatusText,
      }),
    )
    console.log('Status toggled for admin:', admin.id)
  } catch (err) {
    console.error('Failed to toggle admin status:', err)
    appStore.notifyError(
      t('admins.notifications.statusUpdateFailed.title'),
      t('admins.notifications.statusUpdateFailed.message'),
    )
  }
}

const refreshAdmins = () => {
  // Simulate API refresh
  setTimeout(() => {
    updateLastUpdated()
    console.log('Admins refreshed')
  }, 1000)
}

const updateLastUpdated = () => {
  lastUpdated.value = formatNow()
}

// Open global AdminDetail modal and handle result
const openAddAdminModal = () => {
  openModal(AdminDetailModal, {
    title: t('admins.addNewAdmin'),
    currentUserIsSystemAdmin: currentUser.value?.isSystemAdmin(),
  })
}

// Lifecycle
onMounted(async () => {
  currentUser.value = await getCurrentUser()
  updateLastUpdated()

  // Initial load using current filters
  await loadAdmins({ page: 1 })

  console.log('AdminManagement component mounted')
})
</script>

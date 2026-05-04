import type { Admin, CreateAdminRequest, CreateAdminResponse, GetAdminListQuery } from '@/types'
import { Status, type PaginationMetadata, useAppStore } from '@hivespace/shared'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminService } from '@/services/admin.service'

const toAdmin = (value: Admin | CreateAdminResponse): Admin => {
  if ('status' in value) {
    return {
      ...value,
      updatedAt: value.updatedAt ?? null,
      lastLoginAt: value.lastLoginAt ?? null,
      avatarUrl: value.avatarUrl ?? null,
    }
  }

  return {
    id: value.id,
    username: value.email ?? value.id,
    fullName: value.fullName,
    email: value.email,
    status: value.isActive ? Status.Active : Status.Inactive,
    isSystemAdmin: value.isSystemAdmin,
    createdAt: value.createdAt,
    lastLoginAt: value.lastLoginAt ?? null,
    updatedAt: value.updatedAt ?? null,
    avatarUrl: value.avatarUrl ?? null,
  }
}

export const useAdminStore = defineStore('admin', () => {
  // State
  const createdAdmin = ref<Admin | null>(null)
  // List of admins and pagination returned from the API
  const admins = ref<Admin[]>([])
  const pagination = ref<PaginationMetadata | null>(null)

  const setCreatedAdmin = (admin: Admin | null) => {
    createdAdmin.value = admin
  }

  const setAdmins = (data: Admin[]) => {
    admins.value = data
  }

  const createAdmin = async (adminData: CreateAdminRequest) => {
    const appStore = useAppStore()

    try {
      // Show loading state
      appStore.setLoading(true)
      setCreatedAdmin(null)

      const response = await adminService.createAdmin(adminData)
      const admin = toAdmin(response)

      setCreatedAdmin(admin)
      setAdmins([admin, ...admins.value]) // Add to the start of the list
      if (pagination.value) {
        pagination.value.totalItems += 1
      }
      return admin
    } finally {
      // Hide loading state
      appStore.setLoading(false)
    }
  }

  /**
   * Fetch paginated admin list from backend and update state
   */
  const fetchAdmins = async (params?: GetAdminListQuery) => {
    const appStore = useAppStore()
    try {
      appStore.setLoading(true)
      const response = await adminService.getAdmins(params)
      admins.value = (response?.admins || []).map(toAdmin)

      pagination.value = response?.pagination || null
      return response
    } finally {
      appStore.setLoading(false)
    }
  }

  const toggleAdminStatus = async (adminId: string) => {
    const appStore = useAppStore()
    try {
      appStore.setLoading(true)
      const admin = admins.value.find((a) => a.id === adminId)
      if (!admin) return

      // Toggle status based on current status (1 = Active, 0 = Inactive)
      const updatedAdmin = await adminService.updateAdminStatus(
        adminId,
        !(admin.status === Status.Active),
      )

      // Update admin in local state
      const index = admins.value.findIndex((a) => a.id === adminId)
      if (index !== -1) {
        admins.value[index] = toAdmin(updatedAdmin)
      }
    } finally {
      appStore.setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    const appStore = useAppStore()
    try {
      appStore.setLoading(true)
      await adminService.deleteUser(userId)

      // Remove user from local state
      const index = admins.value.findIndex((a) => a.id === userId)
      if (index !== -1) {
        admins.value.splice(index, 1)
      }
      if (pagination.value) {
        pagination.value.totalItems = Math.max(0, pagination.value.totalItems - 1)
      }
    } finally {
      appStore.setLoading(false)
    }
  }

  const clearState = () => {
    setCreatedAdmin(null)
  }

  return {
    // State
    createdAdmin,
    admins,
    pagination,
    // Actions
    setCreatedAdmin,
    createAdmin,
    fetchAdmins,
    toggleAdminStatus,
    deleteUser,
    clearState,
  }
})

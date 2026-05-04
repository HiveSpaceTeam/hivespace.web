import {
  type PaginationMetadata,
  Status,
} from '@hivespace/shared'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services/user.service'
import { useAppStore } from '@hivespace/shared'
import { type GetUserListQuery, type User } from '@/types'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([])
  const pagination = ref<PaginationMetadata | null>(null)

  const setUsers = (data: User[]) => {
    users.value = data
  }

  /**
   * Fetch paginated user list from backend and update state
   */
  const fetchUsers = async (params?: GetUserListQuery) => {
    const appStore = useAppStore()
    try {
      appStore.setLoading(true)
      const response = await userService.getUsers(params)
      // Response contains API-shaped User objects; store them directly
      const apiUsers = response?.users || []
      users.value = apiUsers as User[]

      pagination.value = response?.pagination || null
      return response
    } finally {
      appStore.setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    const appStore = useAppStore()
    try {
      appStore.setLoading(true)
      await userService.deleteUser(userId)
      // Remove user from local state
      users.value = users.value.filter((user) => user.id !== userId)
      // Update pagination total to keep UI consistent
      if (pagination.value) {
        pagination.value.totalItems = Math.max(0, pagination.value.totalItems - 1)
      }
    } finally {
      appStore.setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string) => {
    const appStore = useAppStore()
    try {
      appStore.setLoading(true)
      const user = users.value.find((u) => u.id === userId)
      if (!user) return

      // Toggle status based on current status (1 = Active, 0 = Inactive)
      const updatedUser = await userService.updateUserStatus(
        userId,
        !(user.status === Status.Active),
      )

      // Update user in local state
      const index = users.value.findIndex((u) => u.id === userId)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
    } finally {
      appStore.setLoading(false)
    }
  }

  const clearState = () => {
    setUsers([])
    pagination.value = null
  }

  return {
    // State
    users,
    pagination,
    // Actions
    setUsers,
    fetchUsers,
    deleteUser,
    toggleUserStatus,
    clearState,
  }
})

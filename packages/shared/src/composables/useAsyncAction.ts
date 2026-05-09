import { ref } from 'vue'

export const useAsyncAction = () => {
  const isLoading = ref(false)

  const run = async <T>(fn: () => Promise<T>): Promise<T> => {
    isLoading.value = true
    try {
      return await fn()
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, run }
}

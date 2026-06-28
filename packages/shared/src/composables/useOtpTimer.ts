import { computed, getCurrentScope, onScopeDispose, ref, watch, type Ref } from 'vue'

const toEpochMs = (value: string | null): number | null => {
  if (!value) return null

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

const formatRemaining = (remainingSeconds: number): string => {
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export const useOtpTimer = (target: Ref<string | null> | string | null) => {
  const targetRef = typeof target === 'string' || target === null ? ref(target) : target
  const now = ref(Date.now())
  let intervalId: ReturnType<typeof setInterval> | null = null

  const clearTimer = () => {
    if (!intervalId) return

    clearInterval(intervalId)
    intervalId = null
  }

  const syncTimer = () => {
    clearTimer()
    now.value = Date.now()

    const targetMs = toEpochMs(targetRef.value)
    if (targetMs === null || targetMs <= now.value) return

    intervalId = setInterval(() => {
      now.value = Date.now()

      const currentTarget = toEpochMs(targetRef.value)
      if (currentTarget === null || currentTarget <= now.value) {
        clearTimer()
      }
    }, 1000)
  }

  const remainingSeconds = computed(() => {
    const targetMs = toEpochMs(targetRef.value)
    if (targetMs === null) return 0

    return Math.max(0, Math.ceil((targetMs - now.value) / 1000))
  })

  const isExpired = computed(() => remainingSeconds.value === 0)
  const displayValue = computed(() => formatRemaining(remainingSeconds.value))

  const setTarget = (value: string | null) => {
    targetRef.value = value
  }

  watch(targetRef, syncTimer, { immediate: true })
  if (getCurrentScope()) {
    onScopeDispose(clearTimer)
  }

  return {
    displayValue,
    isExpired,
    remainingSeconds,
    setTarget,
    target: targetRef,
  }
}

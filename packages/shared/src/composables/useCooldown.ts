import { onUnmounted, ref } from 'vue'

export function useCooldown(durationSeconds: number) {
  const isActive = ref(false)
  const secondsRemaining = ref(durationSeconds)
  let timerId: ReturnType<typeof setInterval> | null = null

  const stop = () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }

    isActive.value = false
    secondsRemaining.value = durationSeconds
  }

  const start = () => {
    stop()

    isActive.value = true
    secondsRemaining.value = durationSeconds
    timerId = setInterval(() => {
      if (secondsRemaining.value <= 1) {
        stop()
        return
      }

      secondsRemaining.value -= 1
    }, 1000)
  }

  onUnmounted(stop)

  return {
    isActive,
    secondsRemaining,
    start,
    stop,
  }
}

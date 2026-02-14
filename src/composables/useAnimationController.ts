import { ref, computed } from 'vue'

export function useAnimationController(totalSteps: number) {
  const currentStep = ref(0)
  const isPlaying = ref(false)
  const playbackSpeed = ref(1000) // ms per step

  let intervalId: ReturnType<typeof setInterval> | null = null

  const isFirstStep = computed(() => currentStep.value === 0)
  const isLastStep = computed(() => currentStep.value >= totalSteps - 1)
  const progress = computed(() =>
    totalSteps > 1 ? currentStep.value / (totalSteps - 1) : 1,
  )

  function play() {
    if (isPlaying.value) return
    isPlaying.value = true
    intervalId = setInterval(() => {
      if (currentStep.value < totalSteps - 1) {
        currentStep.value++
      } else {
        pause()
      }
    }, playbackSpeed.value)
  }

  function pause() {
    isPlaying.value = false
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function stepForward() {
    pause()
    if (currentStep.value < totalSteps - 1) {
      currentStep.value++
    }
  }

  function stepBackward() {
    pause()
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  function reset() {
    pause()
    currentStep.value = 0
  }

  function goToStep(step: number) {
    pause()
    currentStep.value = Math.max(0, Math.min(step, totalSteps - 1))
  }

  return {
    currentStep,
    isPlaying,
    isFirstStep,
    isLastStep,
    progress,
    play,
    pause,
    stepForward,
    stepBackward,
    reset,
    goToStep,
  }
}

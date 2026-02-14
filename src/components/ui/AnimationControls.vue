<script setup lang="ts">
defineProps<{
  isPlaying: boolean
  isFirstStep: boolean
  isLastStep: boolean
  progress: number
  currentStep: number
  totalSteps: number
}>()

const emit = defineEmits<{
  play: []
  pause: []
  'step-forward': []
  'step-backward': []
  reset: []
}>()
</script>

<template>
  <div class="animation-controls">
    <div class="animation-controls__buttons">
      <button
        class="animation-controls__btn"
        title="В начало"
        :disabled="isFirstStep"
        @click="emit('reset')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="19 20 9 12 19 4 19 20" />
          <line x1="5" y1="19" x2="5" y2="5" />
        </svg>
      </button>
      <button
        class="animation-controls__btn"
        title="Назад"
        :disabled="isFirstStep"
        @click="emit('step-backward')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="19 20 9 12 19 4 19 20" />
        </svg>
      </button>
      <button
        class="animation-controls__btn animation-controls__btn--primary"
        :title="isPlaying ? 'Пауза' : 'Воспроизвести'"
        @click="isPlaying ? emit('pause') : emit('play')"
      >
        <svg v-if="!isPlaying" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      </button>
      <button
        class="animation-controls__btn"
        title="Вперёд"
        :disabled="isLastStep"
        @click="emit('step-forward')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 4 15 12 5 20 5 4" />
        </svg>
      </button>
    </div>
    <div class="animation-controls__progress">
      <div class="animation-controls__bar">
        <div class="animation-controls__fill" :style="{ width: `${progress * 100}%` }" />
      </div>
      <span class="animation-controls__step">
        {{ currentStep + 1 }} / {{ totalSteps }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.animation-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.animation-controls__buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
}

.animation-controls__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.animation-controls__btn:hover:not(:disabled) {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.animation-controls__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.animation-controls__btn--primary {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.animation-controls__btn--primary:hover:not(:disabled) {
  background: var(--accent-primary);
  opacity: 0.9;
  color: var(--bg-primary);
}

.animation-controls__progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.animation-controls__bar {
  flex: 1;
  height: 4px;
  background: var(--border-primary);
  border-radius: 2px;
  overflow: hidden;
}

.animation-controls__fill {
  height: 100%;
  background: var(--accent-primary);
  border-radius: 2px;
  transition: width var(--transition-fast);
}

.animation-controls__step {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  font-family: var(--font-code);
  white-space: nowrap;
}
</style>

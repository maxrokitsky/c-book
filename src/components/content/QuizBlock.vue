<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}>()

const selectedIndex = ref<number | null>(null)
const answered = ref(false)

const isCorrect = computed(() => selectedIndex.value === props.correctIndex)

function select(index: number) {
  if (answered.value) return
  selectedIndex.value = index
  answered.value = true
}

function reset() {
  selectedIndex.value = null
  answered.value = false
}
</script>

<template>
  <div class="quiz-block">
    <div class="quiz-block__header">
      <span class="quiz-block__icon">❓</span>
      <span class="quiz-block__label">Проверьте себя</span>
    </div>
    <p class="quiz-block__question">{{ question }}</p>
    <div class="quiz-block__options">
      <button
        v-for="(option, index) in options"
        :key="index"
        :class="[
          'quiz-block__option',
          {
            'quiz-block__option--selected': selectedIndex === index,
            'quiz-block__option--correct': answered && index === correctIndex,
            'quiz-block__option--wrong': answered && selectedIndex === index && !isCorrect,
          },
        ]"
        @click="select(index)"
      >
        <span class="quiz-block__option-letter">{{ String.fromCharCode(65 + index) }}</span>
        <span>{{ option }}</span>
      </button>
    </div>
    <div v-if="answered" class="quiz-block__result">
      <div :class="['quiz-block__verdict', isCorrect ? 'quiz-block__verdict--correct' : 'quiz-block__verdict--wrong']">
        {{ isCorrect ? '✅ Правильно!' : '❌ Неправильно' }}
      </div>
      <p class="quiz-block__explanation">{{ explanation }}</p>
      <button class="quiz-block__retry" @click="reset">Попробовать снова</button>
    </div>
  </div>
</template>

<style scoped>
.quiz-block {
  margin-bottom: var(--spacing-6);
  border-radius: var(--radius-md);
  border: 1px solid var(--accent-primary);
  background: rgb(57 186 230 / 0.03);
  overflow: hidden;
}

.quiz-block__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: rgb(57 186 230 / 0.08);
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--accent-primary);
}

.quiz-block__question {
  padding: var(--spacing-4);
  font-weight: 500;
  color: var(--text-primary);
  line-height: var(--line-height-normal);
}

.quiz-block__options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: 0 var(--spacing-4) var(--spacing-4);
}

.quiz-block__option {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  background: var(--bg-surface);
  color: var(--text-primary);
  text-align: left;
  transition: all var(--transition-fast);
}

.quiz-block__option:hover:not(.quiz-block__option--selected) {
  border-color: var(--accent-primary);
  background: var(--bg-surface-hover);
}

.quiz-block__option--correct {
  border-color: var(--accent-success) !important;
  background: rgb(127 217 98 / 0.1) !important;
}

.quiz-block__option--wrong {
  border-color: var(--accent-error) !important;
  background: rgb(242 109 120 / 0.1) !important;
}

.quiz-block__option-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  font-weight: 600;
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

.quiz-block__result {
  padding: var(--spacing-4);
  border-top: 1px solid var(--border-primary);
}

.quiz-block__verdict {
  font-weight: 600;
  margin-bottom: var(--spacing-2);
}

.quiz-block__verdict--correct {
  color: var(--accent-success);
}

.quiz-block__verdict--wrong {
  color: var(--accent-error);
}

.quiz-block__explanation {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-3);
}

.quiz-block__retry {
  font-size: var(--font-size-sm);
  color: var(--accent-primary);
  font-weight: 500;
}

.quiz-block__retry:hover {
  text-decoration: underline;
}
</style>

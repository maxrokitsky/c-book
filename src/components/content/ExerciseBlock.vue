<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCodeHighlighter } from '@/composables/useCodeHighlighter'
import { useMarkdownRenderer } from '@/composables/useMarkdownRenderer'

const props = defineProps<{
  title: string
  description: string
  hints: string[]
  solution: string
  solutionLanguage?: string
}>()

const showSolution = ref(false)
const revealedHints = ref(0)
const solutionHtml = ref('')
const descriptionHtml = ref('')
const { highlight } = useCodeHighlighter()
const { render } = useMarkdownRenderer()

const hasMoreHints = computed(() => revealedHints.value < props.hints.length)

function revealHint() {
  if (hasMoreHints.value) {
    revealedHints.value++
  }
}

watch(
  () => props.description,
  async (md) => {
    descriptionHtml.value = await render(md)
  },
  { immediate: true },
)

watch(
  [() => props.solution, () => showSolution.value],
  async () => {
    if (showSolution.value && props.solution) {
      solutionHtml.value = await highlight(
        props.solution,
        props.solutionLanguage || 'c',
      )
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="exercise-block">
    <div class="exercise-block__header">
      <span class="exercise-block__icon">🏋️</span>
      <span class="exercise-block__label">Упражнение</span>
    </div>
    <div class="exercise-block__body">
      <h4 class="exercise-block__title">{{ title }}</h4>
      <div class="exercise-block__description prose" v-html="descriptionHtml" />

      <div v-if="hints.length > 0" class="exercise-block__hints">
        <div
          v-for="(hint, index) in hints.slice(0, revealedHints)"
          :key="index"
          class="exercise-block__hint"
        >
          <span class="exercise-block__hint-label">Подсказка {{ index + 1 }}:</span>
          {{ hint }}
        </div>
        <button
          v-if="hasMoreHints"
          class="exercise-block__hint-btn"
          @click="revealHint"
        >
          Показать подсказку ({{ revealedHints }}/{{ hints.length }})
        </button>
      </div>

      <div class="exercise-block__solution">
        <button
          class="exercise-block__solution-toggle"
          @click="showSolution = !showSolution"
        >
          {{ showSolution ? 'Скрыть решение' : 'Показать решение' }}
        </button>
        <div v-if="showSolution" class="exercise-block__solution-code" v-html="solutionHtml" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.exercise-block {
  margin-bottom: var(--spacing-6);
  border-radius: var(--radius-md);
  border: 1px solid var(--accent-secondary);
  background: rgb(242 158 116 / 0.03);
  overflow: hidden;
}

.exercise-block__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: rgb(242 158 116 / 0.08);
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--accent-secondary);
}

.exercise-block__body {
  padding: var(--spacing-4);
}

.exercise-block__title {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-2);
}

.exercise-block__description {
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-4);
}

.exercise-block__hints {
  margin-bottom: var(--spacing-4);
}

.exercise-block__hint {
  padding: var(--spacing-3);
  margin-bottom: var(--spacing-2);
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  animation: fade-in-up var(--transition-base) both;
}

.exercise-block__hint-label {
  font-weight: 600;
  color: var(--accent-warning);
}

.exercise-block__hint-btn,
.exercise-block__solution-toggle {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--accent-primary);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--accent-primary);
  transition: all var(--transition-fast);
}

.exercise-block__hint-btn:hover,
.exercise-block__solution-toggle:hover {
  background: rgb(57 186 230 / 0.1);
}

.exercise-block__solution {
  margin-top: var(--spacing-4);
}

.exercise-block__solution-code {
  margin-top: var(--spacing-3);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.exercise-block__solution-code :deep(pre) {
  margin: 0;
  padding: var(--spacing-4);
  font-size: var(--font-size-sm);
  line-height: 1.7;
}
</style>

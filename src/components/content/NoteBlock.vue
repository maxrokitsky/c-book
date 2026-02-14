<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMarkdownRenderer } from '@/composables/useMarkdownRenderer'

const props = defineProps<{
  variant: 'tip' | 'warning' | 'info' | 'danger'
  title?: string
  markdown: string
}>()

const html = ref('')
const { render } = useMarkdownRenderer()

watch(
  () => props.markdown,
  async (md) => {
    html.value = await render(md)
  },
  { immediate: true },
)

const icons: Record<string, string> = {
  tip: '💡',
  warning: '⚠️',
  info: 'ℹ️',
  danger: '🚫',
}

const defaultTitles: Record<string, string> = {
  tip: 'Совет',
  warning: 'Внимание',
  info: 'Информация',
  danger: 'Опасно',
}
</script>

<template>
  <div :class="['note-block', `note-block--${variant}`]">
    <div class="note-block__header">
      <span class="note-block__icon">{{ icons[variant] }}</span>
      <span class="note-block__title">{{ title || defaultTitles[variant] }}</span>
    </div>
    <div class="note-block__content prose" v-html="html" />
  </div>
</template>

<style scoped>
.note-block {
  margin-bottom: var(--spacing-6);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  overflow: hidden;
}

.note-block__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.note-block__icon {
  font-size: var(--font-size-lg);
}

.note-block__content {
  padding: 0 var(--spacing-4) var(--spacing-4);
  font-size: var(--font-size-sm);
}

.note-block__content :deep(p:last-child) {
  margin-bottom: 0;
}

.note-block--tip {
  border-color: var(--accent-success);
  background: rgb(127 217 98 / 0.05);
}

.note-block--tip .note-block__header {
  color: var(--accent-success);
}

.note-block--warning {
  border-color: var(--accent-warning);
  background: rgb(230 180 80 / 0.05);
}

.note-block--warning .note-block__header {
  color: var(--accent-warning);
}

.note-block--info {
  border-color: var(--accent-primary);
  background: rgb(57 186 230 / 0.05);
}

.note-block--info .note-block__header {
  color: var(--accent-primary);
}

.note-block--danger {
  border-color: var(--accent-error);
  background: rgb(242 109 120 / 0.05);
}

.note-block--danger .note-block__header {
  color: var(--accent-error);
}
</style>

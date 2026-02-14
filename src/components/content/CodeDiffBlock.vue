<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCodeHighlighter } from '@/composables/useCodeHighlighter'

const props = defineProps<{
  before: string
  after: string
  language?: string
  description?: string
}>()

const activeTab = ref<'before' | 'after'>('before')
const beforeHtml = ref('')
const afterHtml = ref('')
const { highlight } = useCodeHighlighter()

watch(
  () => [props.before, props.after, props.language],
  async () => {
    const lang = props.language || 'c'
    ;[beforeHtml.value, afterHtml.value] = await Promise.all([
      highlight(props.before, lang),
      highlight(props.after, lang),
    ])
  },
  { immediate: true },
)
</script>

<template>
  <div class="code-diff-block">
    <div v-if="description" class="code-diff-block__description">
      {{ description }}
    </div>
    <div class="code-diff-block__tabs">
      <button
        :class="['code-diff-block__tab', { 'code-diff-block__tab--active': activeTab === 'before' }]"
        @click="activeTab = 'before'"
      >
        До
      </button>
      <button
        :class="['code-diff-block__tab', { 'code-diff-block__tab--active': activeTab === 'after' }]"
        @click="activeTab = 'after'"
      >
        После
      </button>
    </div>
    <div class="code-diff-block__content">
      <div v-show="activeTab === 'before'" v-html="beforeHtml" />
      <div v-show="activeTab === 'after'" v-html="afterHtml" />
    </div>
  </div>
</template>

<style scoped>
.code-diff-block {
  margin-bottom: var(--spacing-6);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  overflow: hidden;
}

.code-diff-block__description {
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
}

.code-diff-block__tabs {
  display: flex;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
}

.code-diff-block__tab {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-tertiary);
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
}

.code-diff-block__tab:hover {
  color: var(--text-secondary);
}

.code-diff-block__tab--active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
}

.code-diff-block__content :deep(pre) {
  margin: 0;
  padding: var(--spacing-4);
  background: var(--bg-code) !important;
  font-size: var(--font-size-sm);
  line-height: 1.7;
}
</style>

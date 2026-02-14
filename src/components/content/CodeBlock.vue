<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCodeHighlighter } from '@/composables/useCodeHighlighter'
import CopyButton from '@/components/ui/CopyButton.vue'

const props = defineProps<{
  code: string
  language?: string
  filename?: string
  highlightLines?: number[]
}>()

const html = ref('')
const { highlight } = useCodeHighlighter()

watch(
  () => [props.code, props.language],
  async () => {
    html.value = await highlight(props.code, props.language || 'c')
  },
  { immediate: true },
)
</script>

<template>
  <div class="code-block">
    <div v-if="filename" class="code-block__header">
      <span class="code-block__filename">{{ filename }}</span>
      <CopyButton :text="code" />
    </div>
    <div v-else class="code-block__copy-wrapper">
      <CopyButton :text="code" />
    </div>
    <div class="code-block__content" v-html="html" />
  </div>
</template>

<style scoped>
.code-block {
  position: relative;
  margin-bottom: var(--spacing-6);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-primary);
}

.code-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
}

.code-block__filename {
  font-family: var(--font-code);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.code-block__copy-wrapper {
  position: absolute;
  top: var(--spacing-2);
  right: var(--spacing-2);
  z-index: 1;
}

.code-block__content {
  overflow-x: auto;
}

.code-block__content :deep(pre) {
  margin: 0;
  padding: var(--spacing-4);
  background: var(--bg-code) !important;
  font-size: var(--font-size-sm);
  line-height: 1.7;
}

.code-block__content :deep(code) {
  font-family: var(--font-code);
}
</style>

<script setup lang="ts">
defineProps<{
  content: string
  prompt?: string
}>()
</script>

<template>
  <div class="output-block">
    <div class="output-block__header">
      <span class="output-block__label">Вывод</span>
    </div>
    <pre class="output-block__content"><code><span v-if="prompt" class="output-block__prompt">{{ prompt }}
</span>{{ content }}</code></pre>
  </div>
</template>

<style scoped>
.output-block {
  margin-bottom: var(--spacing-6);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-primary);
}

.output-block__header {
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
}

.output-block__label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  font-weight: 500;
}

.output-block__content {
  margin: 0;
  padding: var(--spacing-4);
  background: #0d1117;
  color: #7fd962;
  font-family: var(--font-code);
  font-size: var(--font-size-sm);
  line-height: 1.7;
  overflow-x: auto;
}

:root.light .output-block__content {
  background: #1e293b;
  color: #86efac;
}

.output-block__prompt {
  color: var(--text-tertiary);
}
</style>

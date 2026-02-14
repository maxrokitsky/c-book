<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'success' | 'warning' | 'info'
}>()
</script>

<template>
  <span :class="['badge', `badge--${variant || 'default'}`]">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.1em 0.6em;
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: 500;
  white-space: nowrap;
}

.badge--default {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.badge--success {
  background: rgb(127 217 98 / 0.15);
  color: var(--accent-success);
}

.badge--warning {
  background: rgb(230 180 80 / 0.15);
  color: var(--accent-warning);
}

.badge--info {
  background: rgb(57 186 230 / 0.15);
  color: var(--accent-primary);
}
</style>

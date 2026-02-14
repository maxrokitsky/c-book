<script setup lang="ts">
defineProps<{
  value: number
  max?: number
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <div :class="['progress-bar', `progress-bar--${size || 'md'}`]">
    <div
      class="progress-bar__fill"
      :style="{ width: `${Math.min((value / (max || 100)) * 100, 100)}%` }"
    />
  </div>
</template>

<style scoped>
.progress-bar {
  width: 100%;
  background: var(--bg-tertiary);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar--sm {
  height: 4px;
}

.progress-bar--md {
  height: 8px;
}

.progress-bar__fill {
  height: 100%;
  background: var(--accent-primary);
  border-radius: 999px;
  transition: width var(--transition-slow);
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  tabs: string[]
  modelValue?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [index: number]
}>()

const activeIndex = ref(props.modelValue ?? 0)

watch(
  () => props.modelValue,
  (v) => {
    if (v !== undefined) activeIndex.value = v
  },
)

function selectTab(index: number) {
  activeIndex.value = index
  emit('update:modelValue', index)
}
</script>

<template>
  <div class="tab-group">
    <div class="tab-group__tabs" role="tablist">
      <button
        v-for="(tab, index) in tabs"
        :key="tab"
        :class="['tab-group__tab', { 'tab-group__tab--active': activeIndex === index }]"
        role="tab"
        :aria-selected="activeIndex === index"
        @click="selectTab(index)"
      >
        {{ tab }}
      </button>
    </div>
    <div class="tab-group__panel" role="tabpanel">
      <slot :active-index="activeIndex" />
    </div>
  </div>
</template>

<style scoped>
.tab-group {
  margin-bottom: var(--spacing-6);
}

.tab-group__tabs {
  display: flex;
  border-bottom: 1px solid var(--border-primary);
  gap: var(--spacing-1);
}

.tab-group__tab {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-tertiary);
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
}

.tab-group__tab:hover {
  color: var(--text-secondary);
}

.tab-group__tab--active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
}

.tab-group__panel {
  padding-top: var(--spacing-4);
}
</style>

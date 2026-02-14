<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue'

const props = defineProps<{
  component: string
  props?: Record<string, unknown>
  caption?: string
}>()

const diagramComponents: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  MemoryVisualizer: defineAsyncComponent(() => import('./MemoryVisualizer.vue')),
  StackFrameVisualizer: defineAsyncComponent(() => import('./StackFrameVisualizer.vue')),
  PointerDiagram: defineAsyncComponent(() => import('./PointerDiagram.vue')),
  CompilationPipeline: defineAsyncComponent(() => import('./CompilationPipeline.vue')),
  ArrayVisualizer: defineAsyncComponent(() => import('./ArrayVisualizer.vue')),
  LinkedListDiagram: defineAsyncComponent(() => import('./LinkedListDiagram.vue')),
  BitRepresentation: defineAsyncComponent(() => import('./BitRepresentation.vue')),
  StructLayoutDiagram: defineAsyncComponent(() => import('./StructLayoutDiagram.vue')),
}

const resolvedComponent = computed(() => diagramComponents[props.component])
</script>

<template>
  <figure class="diagram-container">
    <div class="diagram-container__content">
      <component
        :is="resolvedComponent"
        v-if="resolvedComponent"
        v-bind="props.props || {}"
      />
      <div v-else class="diagram-container__placeholder">
        Диаграмма: {{ component }}
      </div>
    </div>
    <figcaption v-if="caption" class="diagram-container__caption">
      {{ caption }}
    </figcaption>
  </figure>
</template>

<style scoped>
.diagram-container {
  margin-bottom: var(--spacing-6);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  overflow: hidden;
}

.diagram-container__content {
  padding: var(--spacing-6);
  background: var(--bg-secondary);
  display: flex;
  justify-content: center;
  overflow-x: auto;
}

.diagram-container__caption {
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  text-align: center;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-primary);
}

.diagram-container__placeholder {
  padding: var(--spacing-8);
  color: var(--text-tertiary);
  font-style: italic;
}
</style>

<script setup lang="ts">
withDefaults(
  defineProps<{
    nodes?: Array<{ value: string; label?: string }>
  }>(),
  {
    nodes: () => [
      { value: '10', label: 'head' },
      { value: '20' },
      { value: '30' },
      { value: 'NULL' },
    ],
  },
)

const nodeWidth = 80
const nodeHeight = 40
const gap = 50
</script>

<template>
  <div class="linked-list">
    <svg
      :width="nodes.length * (nodeWidth + gap)"
      height="80"
      :viewBox="`0 0 ${nodes.length * (nodeWidth + gap)} 80`"
    >
      <g v-for="(node, i) in nodes" :key="i">
        <!-- Node box -->
        <rect
          :x="i * (nodeWidth + gap)"
          y="16"
          :width="nodeWidth"
          :height="nodeHeight"
          rx="4"
          fill="none"
          :stroke="node.value === 'NULL' ? 'var(--text-tertiary)' : 'var(--accent-primary)'"
          stroke-width="1.5"
        />
        <!-- Value -->
        <text
          :x="i * (nodeWidth + gap) + nodeWidth / 2"
          y="42"
          text-anchor="middle"
          :class="node.value === 'NULL' ? 'linked-list__null' : 'linked-list__value'"
        >
          {{ node.value }}
        </text>
        <!-- Label -->
        <text
          v-if="node.label"
          :x="i * (nodeWidth + gap) + nodeWidth / 2"
          y="12"
          text-anchor="middle"
          class="linked-list__label"
        >
          {{ node.label }}
        </text>
        <!-- Arrow to next -->
        <line
          v-if="i < nodes.length - 1"
          :x1="i * (nodeWidth + gap) + nodeWidth + 4"
          y1="36"
          :x2="(i + 1) * (nodeWidth + gap) - 4"
          y2="36"
          stroke="var(--accent-primary)"
          stroke-width="1.5"
          marker-end="url(#ll-arrow)"
        />
      </g>
      <defs>
        <marker id="ll-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--accent-primary)" />
        </marker>
      </defs>
    </svg>
  </div>
</template>

<style scoped>
.linked-list {
  overflow-x: auto;
}

.linked-list__value {
  font-family: var(--font-code);
  font-size: 14px;
  font-weight: 600;
  fill: var(--text-primary);
}

.linked-list__null {
  font-family: var(--font-code);
  font-size: 12px;
  fill: var(--text-tertiary);
}

.linked-list__label {
  font-family: var(--font-code);
  font-size: 11px;
  fill: var(--accent-secondary);
  font-weight: 500;
}
</style>

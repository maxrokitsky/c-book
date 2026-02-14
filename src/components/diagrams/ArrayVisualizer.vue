<script setup lang="ts">
withDefaults(
  defineProps<{
    values?: (string | number)[]
    labels?: string[]
    highlightIndex?: number
    name?: string
  }>(),
  {
    values: () => [10, 20, 30, 40, 50],
    name: 'arr',
    highlightIndex: -1,
  },
)

const cellWidth = 64
const cellHeight = 44
</script>

<template>
  <div class="array-viz">
    <svg
      :width="Math.max(values.length * cellWidth + 80, 200)"
      height="90"
      :viewBox="`0 0 ${Math.max(values.length * cellWidth + 80, 200)} 90`"
    >
      <!-- Array name -->
      <text x="4" y="40" class="array-viz__name">{{ name }}</text>
      <!-- Cells -->
      <g v-for="(val, i) in values" :key="i">
        <rect
          :x="60 + i * cellWidth"
          y="14"
          :width="cellWidth"
          :height="cellHeight"
          rx="2"
          fill="none"
          :stroke="i === highlightIndex ? 'var(--accent-secondary)' : 'var(--accent-primary)'"
          :stroke-width="i === highlightIndex ? 2 : 1"
        />
        <text
          :x="60 + i * cellWidth + cellWidth / 2"
          y="42"
          text-anchor="middle"
          class="array-viz__value"
        >
          {{ val }}
        </text>
        <!-- Index -->
        <text
          :x="60 + i * cellWidth + cellWidth / 2"
          y="76"
          text-anchor="middle"
          class="array-viz__index"
        >
          [{{ i }}]
        </text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.array-viz {
  overflow-x: auto;
}

.array-viz__name {
  font-family: var(--font-code);
  font-size: 14px;
  font-weight: 600;
  fill: var(--accent-primary);
}

.array-viz__value {
  font-family: var(--font-code);
  font-size: 14px;
  font-weight: 600;
  fill: var(--text-primary);
}

.array-viz__index {
  font-family: var(--font-code);
  font-size: 11px;
  fill: var(--text-tertiary);
}
</style>

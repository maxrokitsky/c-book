<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value?: number
    bits?: number
    label?: string
    highlightBits?: number[]
  }>(),
  {
    value: 42,
    bits: 8,
    label: '42',
    highlightBits: () => [],
  },
)

const binaryString = computed(() => {
  return (props.value >>> 0).toString(2).padStart(props.bits, '0')
})

const cellSize = 40
</script>

<template>
  <div class="bit-repr">
    <div class="bit-repr__label">
      <span class="bit-repr__decimal">{{ label }}</span>
      <span class="bit-repr__equals">=</span>
      <span class="bit-repr__binary">0b{{ binaryString }}</span>
    </div>
    <svg
      :width="bits * cellSize + 20"
      height="70"
      :viewBox="`0 0 ${bits * cellSize + 20} 70`"
    >
      <g v-for="(bit, i) in binaryString.split('')" :key="i">
        <rect
          :x="10 + i * cellSize"
          y="8"
          :width="cellSize - 2"
          height="36"
          rx="3"
          :fill="highlightBits.includes(i) ? 'rgb(57 186 230 / 0.15)' : 'none'"
          :stroke="bit === '1' ? 'var(--accent-primary)' : 'var(--border-secondary)'"
          stroke-width="1.5"
        />
        <text
          :x="10 + i * cellSize + (cellSize - 2) / 2"
          y="32"
          text-anchor="middle"
          :class="bit === '1' ? 'bit-repr__one' : 'bit-repr__zero'"
        >
          {{ bit }}
        </text>
        <text
          :x="10 + i * cellSize + (cellSize - 2) / 2"
          y="60"
          text-anchor="middle"
          class="bit-repr__pos"
        >
          {{ bits - 1 - i }}
        </text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.bit-repr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
}

.bit-repr__label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-family: var(--font-code);
}

.bit-repr__decimal {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.bit-repr__equals {
  color: var(--text-tertiary);
}

.bit-repr__binary {
  font-size: var(--font-size-sm);
  color: var(--accent-primary);
}

.bit-repr__one {
  font-family: var(--font-code);
  font-size: 16px;
  font-weight: 700;
  fill: var(--accent-primary);
}

.bit-repr__zero {
  font-family: var(--font-code);
  font-size: 16px;
  fill: var(--text-tertiary);
}

.bit-repr__pos {
  font-family: var(--font-code);
  font-size: 10px;
  fill: var(--text-tertiary);
}
</style>

<script setup lang="ts">
withDefaults(
  defineProps<{
    name?: string
    fields?: Array<{
      name: string
      type: string
      size: number
      offset: number
    }>
    totalSize?: number
  }>(),
  {
    name: 'struct point',
    fields: () => [
      { name: 'x', type: 'int', size: 4, offset: 0 },
      { name: 'y', type: 'int', size: 4, offset: 4 },
    ],
    totalSize: 8,
  },
)

const scale = 40 // pixels per byte
</script>

<template>
  <div class="struct-layout">
    <div class="struct-layout__name">{{ name }}</div>
    <svg
      :width="Math.max((totalSize || 8) * scale + 40, 200)"
      height="100"
      :viewBox="`0 0 ${Math.max((totalSize || 8) * scale + 40, 200)} 100`"
    >
      <!-- Total struct outline -->
      <rect
        x="20"
        y="20"
        :width="(totalSize || 8) * scale"
        height="40"
        rx="4"
        fill="none"
        stroke="var(--border-secondary)"
        stroke-width="1"
        stroke-dasharray="4,2"
      />
      <!-- Fields -->
      <g v-for="(field, i) in fields" :key="i">
        <rect
          :x="20 + field.offset * scale"
          y="20"
          :width="field.size * scale"
          height="40"
          rx="2"
          fill="none"
          :stroke="['var(--accent-primary)', 'var(--accent-secondary)', 'var(--accent-success)', 'var(--accent-warning)'][i % 4]"
          stroke-width="1.5"
        />
        <text
          :x="20 + field.offset * scale + (field.size * scale) / 2"
          y="36"
          text-anchor="middle"
          class="struct-layout__field-name"
        >
          {{ field.name }}
        </text>
        <text
          :x="20 + field.offset * scale + (field.size * scale) / 2"
          y="52"
          text-anchor="middle"
          class="struct-layout__field-type"
        >
          {{ field.type }} ({{ field.size }}B)
        </text>
        <!-- Offset -->
        <text
          :x="20 + field.offset * scale"
          y="78"
          class="struct-layout__offset"
        >
          +{{ field.offset }}
        </text>
      </g>
      <!-- Total size -->
      <text
        :x="20 + (totalSize || 8) * scale"
        y="78"
        text-anchor="end"
        class="struct-layout__total"
      >
        = {{ totalSize }} байт
      </text>
    </svg>
  </div>
</template>

<style scoped>
.struct-layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  overflow-x: auto;
}

.struct-layout__name {
  font-family: var(--font-code);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--accent-primary);
}

.struct-layout__field-name {
  font-family: var(--font-code);
  font-size: 12px;
  font-weight: 600;
  fill: var(--text-primary);
}

.struct-layout__field-type {
  font-family: var(--font-code);
  font-size: 10px;
  fill: var(--text-tertiary);
}

.struct-layout__offset {
  font-family: var(--font-code);
  font-size: 10px;
  fill: var(--text-tertiary);
}

.struct-layout__total {
  font-family: var(--font-code);
  font-size: 11px;
  fill: var(--text-secondary);
  font-weight: 500;
}
</style>

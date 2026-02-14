<script setup lang="ts">
withDefaults(
  defineProps<{
    pointers?: Array<{
      name: string
      address: string
      pointsTo: string
    }>
    variables?: Array<{
      name: string
      address: string
      value: string
    }>
  }>(),
  {
    pointers: () => [
      { name: 'ptr', address: '0x7ffd00', pointsTo: '0x7ffd08' },
    ],
    variables: () => [
      { name: 'x', address: '0x7ffd08', value: '42' },
    ],
  },
)
</script>

<template>
  <div class="pointer-diagram">
    <svg width="400" height="120" viewBox="0 0 400 120">
      <!-- Pointer boxes -->
      <g v-for="(ptr, i) in pointers" :key="`p-${i}`">
        <rect
          :x="10"
          :y="20 + i * 60"
          width="140"
          height="44"
          rx="4"
          fill="none"
          stroke="var(--accent-primary)"
          stroke-width="1.5"
        />
        <text :x="20" :y="36 + i * 60" class="pointer-diagram__name">{{ ptr.name }}</text>
        <text :x="20" :y="54 + i * 60" class="pointer-diagram__addr">{{ ptr.pointsTo }}</text>
        <!-- Arrow -->
        <line
          x1="154"
          :y1="42 + i * 60"
          x2="240"
          :y2="42 + i * 60"
          stroke="var(--accent-primary)"
          stroke-width="1.5"
          stroke-dasharray="4,3"
          marker-end="url(#ptr-arrow)"
        />
      </g>
      <!-- Variable boxes -->
      <g v-for="(v, i) in variables" :key="`v-${i}`">
        <rect
          x="244"
          :y="20 + i * 60"
          width="140"
          height="44"
          rx="4"
          fill="none"
          stroke="var(--accent-secondary)"
          stroke-width="1.5"
        />
        <text x="254" :y="36 + i * 60" class="pointer-diagram__name">{{ v.name }}</text>
        <text x="254" :y="54 + i * 60" class="pointer-diagram__value">{{ v.value }}</text>
        <text x="348" :y="54 + i * 60" text-anchor="end" class="pointer-diagram__addr">{{ v.address }}</text>
      </g>
      <defs>
        <marker id="ptr-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--accent-primary)" />
        </marker>
      </defs>
    </svg>
  </div>
</template>

<style scoped>
.pointer-diagram__name {
  font-family: var(--font-code);
  font-size: 13px;
  font-weight: 600;
  fill: var(--text-primary);
}

.pointer-diagram__addr {
  font-family: var(--font-code);
  font-size: 11px;
  fill: var(--text-tertiary);
}

.pointer-diagram__value {
  font-family: var(--font-code);
  font-size: 13px;
  font-weight: 600;
  fill: var(--accent-success);
}
</style>

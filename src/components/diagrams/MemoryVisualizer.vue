<script setup lang="ts">
import { useAnimationController } from '@/composables/useAnimationController'
import AnimationControls from '@/components/ui/AnimationControls.vue'

const props = withDefaults(
  defineProps<{
    cells?: Array<{
      address: string
      label: string
      value: string
      type?: 'stack' | 'heap' | 'static' | 'empty'
    }>
    animated?: boolean
  }>(),
  {
    cells: () => [
      { address: '0x7ffd00', label: 'x', value: '42', type: 'stack' as const },
      { address: '0x7ffd04', label: 'y', value: '10', type: 'stack' as const },
      { address: '0x7ffd08', label: 'ptr', value: '0x55a000', type: 'stack' as const },
      { address: '...', label: '', value: '', type: 'empty' as const },
      { address: '0x55a000', label: '*ptr', value: '99', type: 'heap' as const },
    ],
    animated: false,
  },
)

const controller = props.animated
  ? useAnimationController(props.cells.length)
  : null

const typeColors: Record<string, string> = {
  stack: 'var(--accent-primary)',
  heap: 'var(--accent-secondary)',
  static: 'var(--accent-success)',
  empty: 'var(--border-primary)',
}
</script>

<template>
  <div class="memory-viz">
    <svg :width="340" :height="cells.length * 48 + 20" viewBox="0 0 340 ${cells.length * 48 + 20}">
      <g
        v-for="(cell, index) in cells"
        :key="index"
        :transform="`translate(0, ${index * 48})`"
        :opacity="!animated || !controller || index <= controller.currentStep.value ? 1 : 0.15"
        class="memory-viz__cell"
      >
        <!-- Address -->
        <text x="10" y="30" class="memory-viz__address">{{ cell.address }}</text>
        <!-- Cell box -->
        <rect
          x="110"
          y="8"
          width="120"
          height="36"
          rx="4"
          fill="none"
          :stroke="typeColors[cell.type || 'stack']"
          stroke-width="1.5"
        />
        <!-- Value -->
        <text x="170" y="32" text-anchor="middle" class="memory-viz__value">
          {{ cell.value }}
        </text>
        <!-- Label -->
        <text x="250" y="30" class="memory-viz__label">{{ cell.label }}</text>
      </g>
    </svg>
    <div class="memory-viz__legend">
      <span class="memory-viz__legend-item">
        <span class="memory-viz__legend-dot" style="background: var(--accent-primary)" />
        Стек
      </span>
      <span class="memory-viz__legend-item">
        <span class="memory-viz__legend-dot" style="background: var(--accent-secondary)" />
        Куча
      </span>
    </div>
    <AnimationControls
      v-if="animated && controller"
      :is-playing="controller.isPlaying.value"
      :is-first-step="controller.isFirstStep.value"
      :is-last-step="controller.isLastStep.value"
      :progress="controller.progress.value"
      :current-step="controller.currentStep.value"
      :total-steps="cells.length"
      @play="controller.play"
      @pause="controller.pause"
      @step-forward="controller.stepForward"
      @step-backward="controller.stepBackward"
      @reset="controller.reset"
    />
  </div>
</template>

<style scoped>
.memory-viz {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.memory-viz__cell {
  transition: opacity var(--transition-base);
}

.memory-viz__address {
  font-family: var(--font-code);
  font-size: 12px;
  fill: var(--text-tertiary);
}

.memory-viz__value {
  font-family: var(--font-code);
  font-size: 14px;
  font-weight: 600;
  fill: var(--text-primary);
}

.memory-viz__label {
  font-family: var(--font-code);
  font-size: 13px;
  fill: var(--accent-primary);
}

.memory-viz__legend {
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
}

.memory-viz__legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.memory-viz__legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>

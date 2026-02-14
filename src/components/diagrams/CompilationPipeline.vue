<script setup lang="ts">
import { useAnimationController } from '@/composables/useAnimationController'
import AnimationControls from '@/components/ui/AnimationControls.vue'

const stages = [
  { label: 'Исходный код', detail: '.c файл', color: 'var(--accent-primary)' },
  { label: 'Препроцессор', detail: 'cpp', color: 'var(--accent-warning)' },
  { label: 'Компилятор', detail: 'cc1', color: 'var(--accent-secondary)' },
  { label: 'Ассемблер', detail: 'as', color: 'var(--accent-success)' },
  { label: 'Линковщик', detail: 'ld', color: 'var(--accent-error)' },
  { label: 'Исполняемый файл', detail: 'a.out', color: 'var(--accent-primary)' },
]

const controller = useAnimationController(stages.length)
</script>

<template>
  <div class="compilation-pipeline">
    <svg width="100%" height="80" viewBox="0 0 720 80" preserveAspectRatio="xMidYMid meet">
      <g v-for="(stage, index) in stages" :key="index">
        <rect
          :x="index * 120"
          y="10"
          width="100"
          height="56"
          rx="6"
          :fill="index <= controller.currentStep.value ? stage.color : 'none'"
          :fill-opacity="index <= controller.currentStep.value ? 0.15 : 0"
          :stroke="stage.color"
          :stroke-opacity="index <= controller.currentStep.value ? 1 : 0.25"
          stroke-width="1.5"
          class="compilation-pipeline__stage"
        />
        <text
          :x="index * 120 + 50"
          y="34"
          text-anchor="middle"
          class="compilation-pipeline__label"
          :fill="index <= controller.currentStep.value ? 'var(--text-primary)' : 'var(--text-tertiary)'"
        >
          {{ stage.label }}
        </text>
        <text
          :x="index * 120 + 50"
          y="52"
          text-anchor="middle"
          class="compilation-pipeline__detail"
        >
          {{ stage.detail }}
        </text>
        <!-- Arrow -->
        <line
          v-if="index < stages.length - 1"
          :x1="index * 120 + 104"
          y1="38"
          :x2="(index + 1) * 120 - 4"
          y2="38"
          stroke="var(--text-tertiary)"
          :stroke-opacity="index < controller.currentStep.value ? 1 : 0.25"
          stroke-width="1.5"
          marker-end="url(#arrowhead)"
        />
      </g>
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--text-tertiary)" />
        </marker>
      </defs>
    </svg>
    <AnimationControls
      :is-playing="controller.isPlaying.value"
      :is-first-step="controller.isFirstStep.value"
      :is-last-step="controller.isLastStep.value"
      :progress="controller.progress.value"
      :current-step="controller.currentStep.value"
      :total-steps="stages.length"
      @play="controller.play"
      @pause="controller.pause"
      @step-forward="controller.stepForward"
      @step-backward="controller.stepBackward"
      @reset="controller.reset"
    />
  </div>
</template>

<style scoped>
.compilation-pipeline {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  width: 100%;
}

.compilation-pipeline__stage {
  transition: all var(--transition-base);
}

.compilation-pipeline__label {
  font-size: 11px;
  font-weight: 600;
  transition: fill var(--transition-base);
}

.compilation-pipeline__detail {
  font-family: var(--font-code);
  font-size: 10px;
  fill: var(--text-tertiary);
}
</style>

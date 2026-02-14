<script setup lang="ts">
import { useAnimationController } from '@/composables/useAnimationController'
import AnimationControls from '@/components/ui/AnimationControls.vue'

const props = withDefaults(
  defineProps<{
    frames?: Array<{
      name: string
      variables: Array<{ name: string; value: string }>
    }>
  }>(),
  {
    frames: () => [
      { name: 'main()', variables: [{ name: 'a', value: '5' }, { name: 'b', value: '3' }] },
      { name: 'add(a, b)', variables: [{ name: 'x', value: '5' }, { name: 'y', value: '3' }, { name: 'result', value: '8' }] },
    ],
  },
)

const controller = useAnimationController(props.frames.length)

function frameHeight(frame: { variables: Array<unknown> }) {
  return 32 + frame.variables.length * 28
}

function frameY(index: number) {
  let y = 10
  for (let i = props.frames.length - 1; i > index; i--) {
    y += frameHeight(props.frames[i]!) + 8
  }
  return y
}

const totalHeight = props.frames.reduce(
  (h, f) => h + frameHeight(f) + 8,
  20,
)
</script>

<template>
  <div class="stack-viz">
    <div class="stack-viz__header">
      <span class="stack-viz__arrow">↑ Адреса растут</span>
      <span class="stack-viz__title">Стек вызовов</span>
    </div>
    <svg width="280" :height="totalHeight" :viewBox="`0 0 280 ${totalHeight}`">
      <g
        v-for="(frame, index) in [...frames].reverse()"
        :key="index"
        :opacity="!controller || index <= controller.currentStep.value ? 1 : 0.15"
      >
        <rect
          x="10"
          :y="frameY(frames.length - 1 - index)"
          width="260"
          :height="frameHeight(frame)"
          rx="4"
          fill="none"
          stroke="var(--accent-primary)"
          :stroke-opacity="0.5"
          stroke-width="1"
        />
        <text
          x="20"
          :y="frameY(frames.length - 1 - index) + 20"
          class="stack-viz__frame-name"
        >
          {{ frame.name }}
        </text>
        <g v-for="(v, vi) in frame.variables" :key="vi">
          <text
            x="30"
            :y="frameY(frames.length - 1 - index) + 42 + vi * 28"
            class="stack-viz__var-name"
          >
            {{ v.name }}
          </text>
          <text
            x="120"
            :y="frameY(frames.length - 1 - index) + 42 + vi * 28"
            class="stack-viz__var-value"
          >
            = {{ v.value }}
          </text>
        </g>
      </g>
    </svg>
    <AnimationControls
      :is-playing="controller.isPlaying.value"
      :is-first-step="controller.isFirstStep.value"
      :is-last-step="controller.isLastStep.value"
      :progress="controller.progress.value"
      :current-step="controller.currentStep.value"
      :total-steps="frames.length"
      @play="controller.play"
      @pause="controller.pause"
      @step-forward="controller.stepForward"
      @step-backward="controller.stepBackward"
      @reset="controller.reset"
    />
  </div>
</template>

<style scoped>
.stack-viz {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.stack-viz__header {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.stack-viz__arrow {
  opacity: 0.6;
}

.stack-viz__title {
  font-weight: 600;
}

.stack-viz__frame-name {
  font-family: var(--font-code);
  font-size: 13px;
  font-weight: 600;
  fill: var(--accent-primary);
}

.stack-viz__var-name {
  font-family: var(--font-code);
  font-size: 12px;
  fill: var(--text-secondary);
}

.stack-viz__var-value {
  font-family: var(--font-code);
  font-size: 12px;
  fill: var(--accent-success);
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMarkdownRenderer } from '@/composables/useMarkdownRenderer'

const props = defineProps<{
  markdown: string
}>()

const html = ref('')
const { render } = useMarkdownRenderer()

watch(
  () => props.markdown,
  async (md) => {
    html.value = await render(md)
  },
  { immediate: true },
)
</script>

<template>
  <div class="prose-block prose" v-html="html" />
</template>

<style scoped>
.prose-block {
  margin-bottom: var(--spacing-6);
}
</style>

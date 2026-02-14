<script setup lang="ts">
import { computed } from 'vue'
import type { ContentBlock } from '@/content/types'
import ProseBlock from './ProseBlock.vue'
import CodeBlock from './CodeBlock.vue'
import OutputBlock from './OutputBlock.vue'
import NoteBlock from './NoteBlock.vue'
import QuizBlock from './QuizBlock.vue'
import ExerciseBlock from './ExerciseBlock.vue'
import CodeDiffBlock from './CodeDiffBlock.vue'
import DiagramContainer from '@/components/diagrams/DiagramContainer.vue'

const props = defineProps<{
  blocks: ContentBlock[]
}>()

// Strip leading h1 from the first prose block — it duplicates the chapter header
const processedBlocks = computed(() =>
  props.blocks.map((block, i) => {
    if (i === 0 && block.type === 'prose') {
      const stripped = block.markdown.replace(/^#\s+.+\n*/, '')
      return { ...block, markdown: stripped }
    }
    return block
  }),
)
</script>

<template>
  <div class="chapter-content">
    <template v-for="(block, index) in processedBlocks" :key="index">
      <ProseBlock v-if="block.type === 'prose'" :markdown="block.markdown" />
      <CodeBlock
        v-else-if="block.type === 'code'"
        :code="block.code"
        :language="block.language"
        :filename="block.filename"
        :highlight-lines="block.highlightLines"
      />
      <OutputBlock
        v-else-if="block.type === 'output'"
        :content="block.content"
        :prompt="block.prompt"
      />
      <NoteBlock
        v-else-if="block.type === 'note'"
        :variant="block.variant"
        :title="block.title"
        :markdown="block.markdown"
      />
      <DiagramContainer
        v-else-if="block.type === 'diagram'"
        :component="block.component"
        :props="block.props"
        :caption="block.caption"
      />
      <QuizBlock
        v-else-if="block.type === 'quiz'"
        :question="block.question"
        :options="block.options"
        :correct-index="block.correctIndex"
        :explanation="block.explanation"
      />
      <ExerciseBlock
        v-else-if="block.type === 'exercise'"
        :title="block.title"
        :description="block.description"
        :hints="block.hints"
        :solution="block.solution"
        :solution-language="block.solutionLanguage"
      />
      <CodeDiffBlock
        v-else-if="block.type === 'codeDiff'"
        :before="block.before"
        :after="block.after"
        :language="block.language"
        :description="block.description"
      />
    </template>
  </div>
</template>

<style scoped>
.chapter-content {
  padding-bottom: var(--spacing-16);
}
</style>

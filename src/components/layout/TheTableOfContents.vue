<script setup lang="ts">
const props = defineProps<{
  headings: Array<{ id: string; text: string; level: number }>
  activeId?: string
}>()

function indent(level: number): string {
  const base = level - 2
  if (base <= 0) return '0'
  return `${base * 12}px`
}
</script>

<template>
  <aside class="toc">
    <div class="toc__header">На этой странице</div>
    <ul class="toc__list">
      <li
        v-for="heading in props.headings"
        :key="heading.id"
        class="toc__item"
        :style="{ paddingLeft: indent(heading.level) }"
      >
        <a
          :href="`#${heading.id}`"
          class="toc__link"
          :class="{ 'toc__link--active': props.activeId === heading.id }"
        >
          {{ heading.text }}
        </a>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.toc {
  position: sticky;
  top: 0;
  max-height: calc(100vh - var(--topbar-height) - var(--spacing-16));
  overflow-y: auto;
  padding: var(--spacing-4);
  width: var(--toc-width);
  flex-shrink: 0;
}

.toc__header {
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-3);
}

.toc__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc__item {
  margin: 0;
}

.toc__link {
  display: block;
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: color var(--transition-fast), border-color var(--transition-fast);
  line-height: var(--line-height-normal);
}

.toc__link:hover {
  color: var(--text-primary);
}

.toc__link--active {
  color: var(--accent-primary);
  border-left-color: var(--accent-primary);
}

@media (max-width: 1279px) {
  .toc {
    display: none;
  }
}
</style>

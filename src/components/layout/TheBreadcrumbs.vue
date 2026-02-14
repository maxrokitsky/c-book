<script setup lang="ts">
import { findChapterMeta, findSection } from '@/content/index'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const sectionId = computed(() => route.params.sectionId as string | undefined)
const chapterId = computed(() => route.params.chapterId as string | undefined)

const section = computed(() => {
  if (!sectionId.value) return undefined
  return findSection(sectionId.value)
})

const chapter = computed(() => {
  if (!sectionId.value || !chapterId.value) return undefined
  const meta = findChapterMeta(sectionId.value, chapterId.value)
  return meta?.chapter
})

const crumbs = computed(() => {
  const items: { label: string; to: string | null }[] = [
    { label: 'Главная', to: '/' },
  ]

  if (section.value) {
    items.push({
      label: section.value.title,
      to: chapterId.value ? `/${sectionId.value}` : null,
    })
  }

  if (chapter.value) {
    items.push({
      label: chapter.value.title,
      to: null,
    })
  }

  return items
})
</script>

<template>
  <nav v-if="crumbs.length > 1" class="breadcrumbs" aria-label="Навигация">
    <ol class="breadcrumbs__list">
      <li
        v-for="(crumb, index) in crumbs"
        :key="index"
        class="breadcrumbs__item"
      >
        <RouterLink
          v-if="crumb.to"
          :to="crumb.to"
          class="breadcrumbs__link"
        >
          {{ crumb.label }}
        </RouterLink>
        <span v-else class="breadcrumbs__current">
          {{ crumb.label }}
        </span>
        <span
          v-if="index < crumbs.length - 1"
          class="breadcrumbs__separator"
          aria-hidden="true"
        >
          &rsaquo;
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumbs {
  margin-bottom: var(--spacing-4);
}

.breadcrumbs__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

.breadcrumbs__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
}

.breadcrumbs__link {
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.breadcrumbs__link:hover {
  color: var(--accent-primary);
}

.breadcrumbs__current {
  color: var(--text-secondary);
}

.breadcrumbs__separator {
  color: var(--text-tertiary);
  font-size: var(--font-size-base);
  user-select: none;
}
</style>

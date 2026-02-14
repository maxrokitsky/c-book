<script setup lang="ts">
import { computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useChapterContent } from '@/composables/useChapterContent'
import { useTableOfContents } from '@/composables/useTableOfContents'
import { useKeyboardNavigation } from '@/composables/useKeyboardNavigation'
import { findChapterMeta, getAdjacentChapters } from '@/content/index'
import { useNavigationStore } from '@/stores/navigation'
import { useSearchStore } from '@/stores/search'
import ChapterRenderer from '@/components/content/ChapterRenderer.vue'
import TheBreadcrumbs from '@/components/layout/TheBreadcrumbs.vue'
import TheTableOfContents from '@/components/layout/TheTableOfContents.vue'
import TheFooterNav from '@/components/layout/TheFooterNav.vue'
import SearchOverlay from '@/components/ui/SearchOverlay.vue'

const route = useRoute()
const navigation = useNavigationStore()
const search = useSearchStore()
const { chapter, loading, error, loadChapter } = useChapterContent()
const { headings, activeId, refresh } = useTableOfContents()

const sectionId = computed(() => route.params.sectionId as string)
const chapterId = computed(() => route.params.chapterId as string)
const meta = computed(() => findChapterMeta(sectionId.value, chapterId.value))
const adjacent = computed(() => getAdjacentChapters(sectionId.value, chapterId.value))

watch(
  [sectionId, chapterId],
  async ([sid, cid]) => {
    navigation.setCurrentLocation(sid, cid)
    await loadChapter(sid, cid)
    document.querySelector('.book-layout__content')?.scrollTo(0, 0)
    await nextTick()
    refresh()
  },
  { immediate: true },
)

useKeyboardNavigation({
  prev: computed(() => adjacent.value.prev ?? null),
  next: computed(() => adjacent.value.next ?? null),
  onSearchOpen: () => search.openSearch(),
})
</script>

<template>
  <div class="chapter-view">
    <TheBreadcrumbs />

    <div v-if="loading" class="chapter-view__loading">
      <div class="chapter-view__spinner" />
      <span>Загрузка главы...</span>
    </div>

    <div v-else-if="error" class="chapter-view__error">
      <h2>Ошибка</h2>
      <p>{{ error }}</p>
      <RouterLink to="/">Вернуться на главную</RouterLink>
    </div>

    <template v-else-if="chapter && meta">
      <div class="chapter-view__body">
        <div class="chapter-view__content">
          <header class="chapter-view__header">
            <div class="chapter-view__section-label">
              {{ meta.section.title }}
            </div>
            <h1 class="chapter-view__title">{{ chapter.title }}</h1>
            <p class="chapter-view__description">{{ chapter.description }}</p>
          </header>
          <ChapterRenderer :blocks="chapter.blocks" />
          <TheFooterNav :prev="adjacent.prev" :next="adjacent.next" />
        </div>
        <TheTableOfContents :headings="headings" :active-id="activeId" />
      </div>
    </template>

    <SearchOverlay />
  </div>
</template>

<style scoped>
.chapter-view {
  padding-bottom: var(--spacing-8);
}

.chapter-view__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-16) 0;
  color: var(--text-tertiary);
}

.chapter-view__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-primary);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.chapter-view__error {
  text-align: center;
  padding: var(--spacing-16) 0;
}

.chapter-view__error h2 {
  color: var(--accent-error);
  margin-bottom: var(--spacing-4);
}

.chapter-view__error p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-6);
}

.chapter-view__header {
  margin-bottom: var(--spacing-8);
  padding-bottom: var(--spacing-6);
  border-bottom: 1px solid var(--border-primary);
}

.chapter-view__section-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--accent-primary);
  margin-bottom: var(--spacing-2);
}

.chapter-view__title {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-3);
}

.chapter-view__description {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

.chapter-view__body {
  display: flex;
  gap: var(--spacing-8);
}

.chapter-view__content {
  flex: 1;
  min-width: 0;
  max-width: var(--content-max-width);
  margin: 0 auto;
}

@media (max-width: 1279px) {
  .chapter-view__body {
    display: block;
  }
}
</style>

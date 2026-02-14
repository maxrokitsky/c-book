<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { findSection } from '@/content/index'
import { useNavigationStore } from '@/stores/navigation'
import { useProgressStore } from '@/stores/progress'
import TheBreadcrumbs from '@/components/layout/TheBreadcrumbs.vue'
import Badge from '@/components/ui/Badge.vue'

const route = useRoute()
const navigation = useNavigationStore()
const progress = useProgressStore()

const sectionId = computed(() => route.params.sectionId as string)
const section = computed(() => findSection(sectionId.value))

watch(
  sectionId,
  (id) => {
    navigation.setCurrentLocation(id)
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="section" class="section-overview">
    <TheBreadcrumbs />

    <header class="section-overview__header">
      <span class="section-overview__icon">{{ section.icon }}</span>
      <h1 class="section-overview__title">{{ section.title }}</h1>
      <p class="section-overview__description">{{ section.description }}</p>
    </header>

    <div class="section-overview__chapters">
      <RouterLink
        v-for="(chapter, index) in section.chapters"
        :key="chapter.id"
        :to="`/${sectionId}/${chapter.id}`"
        class="chapter-card"
      >
        <span class="chapter-card__number">{{ String(index + 1).padStart(2, '0') }}</span>
        <div class="chapter-card__content">
          <div class="chapter-card__title-row">
            <h3 class="chapter-card__title">{{ chapter.title }}</h3>
            <Badge v-if="progress.isCompleted(sectionId, chapter.id)" variant="success">
              Пройдено
            </Badge>
          </div>
          <p class="chapter-card__description">{{ chapter.description }}</p>
        </div>
        <svg class="chapter-card__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </RouterLink>
    </div>
  </div>
  <div v-else class="section-overview__not-found">
    <h1>Раздел не найден</h1>
    <p>Раздел «{{ sectionId }}» не существует.</p>
    <RouterLink to="/">Вернуться на главную</RouterLink>
  </div>
</template>

<style scoped>
.section-overview {
  padding-bottom: var(--spacing-16);
}

.section-overview__header {
  margin-bottom: var(--spacing-8);
}

.section-overview__icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: var(--spacing-3);
}

.section-overview__title {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-3);
}

.section-overview__description {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  max-width: 600px;
}

.section-overview__chapters {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.chapter-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4) var(--spacing-5);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-fast);
}

.chapter-card:hover {
  border-color: var(--accent-primary);
  background: var(--bg-surface);
  text-decoration: none;
}

.chapter-card__number {
  font-family: var(--font-code);
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  font-weight: 600;
  flex-shrink: 0;
  width: 28px;
}

.chapter-card__content {
  flex: 1;
  min-width: 0;
}

.chapter-card__title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: 2px;
}

.chapter-card__title {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-primary);
}

.chapter-card__description {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.chapter-card__arrow {
  color: var(--text-tertiary);
  flex-shrink: 0;
  transition: color var(--transition-fast);
}

.chapter-card:hover .chapter-card__arrow {
  color: var(--accent-primary);
}

.section-overview__not-found {
  text-align: center;
  padding: var(--spacing-16) 0;
}

.section-overview__not-found h1 {
  margin-bottom: var(--spacing-4);
}

.section-overview__not-found p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-6);
}
</style>

<script setup lang="ts">
import { tableOfContents } from '@/content/index'
import { useProgressStore } from '@/stores/progress'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import SearchOverlay from '@/components/ui/SearchOverlay.vue'
import { useSearchStore } from '@/stores/search'

const progress = useProgressStore()
const search = useSearchStore()

const totalChapters = tableOfContents.sections.reduce(
  (sum, s) => sum + s.chapters.length,
  0,
)
</script>

<template>
  <div class="home">
    <section class="hero">
      <div class="hero__content">
        <h1 class="hero__title">
          Интерактивный учебник
          <span class="hero__accent">языка C</span>
        </h1>
        <p class="hero__description">
          Комплексный курс от основ до продвинутых тем — с визуализациями,
          интерактивными диаграммами, упражнениями и реальными проектами.
        </p>
        <div class="hero__stats">
          <div class="hero__stat">
            <span class="hero__stat-value">{{ totalChapters }}</span>
            <span class="hero__stat-label">глав</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value">{{ tableOfContents.sections.length }}</span>
            <span class="hero__stat-label">раздела</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value">8</span>
            <span class="hero__stat-label">проектов</span>
          </div>
        </div>
        <div class="hero__actions">
          <RouterLink to="/language/introduction" class="hero__btn hero__btn--primary">
            Начать обучение
          </RouterLink>
          <button class="hero__btn hero__btn--secondary" @click="search.openSearch()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Поиск
            <kbd class="hero__kbd">⌘K</kbd>
          </button>
        </div>
        <div v-if="progress.totalProgress > 0" class="hero__progress">
          <span class="hero__progress-label">Общий прогресс: {{ progress.totalProgress }}%</span>
          <ProgressBar :value="progress.totalProgress" />
        </div>
      </div>
    </section>

    <section class="sections">
      <h2 class="sections__title">Разделы</h2>
      <div class="sections__grid">
        <RouterLink
          v-for="section in tableOfContents.sections"
          :key="section.id"
          :to="`/${section.id}`"
          class="section-card"
        >
          <span class="section-card__icon">{{ section.icon }}</span>
          <h3 class="section-card__title">{{ section.title }}</h3>
          <p class="section-card__description">{{ section.description }}</p>
          <span class="section-card__count">
            {{ section.chapters.length }} {{ section.chapters.length === 1 ? 'глава' : section.chapters.length < 5 ? 'главы' : 'глав' }}
          </span>
        </RouterLink>
      </div>
    </section>

    <SearchOverlay />
  </div>
</template>

<style scoped>
.home {
  padding: var(--spacing-8) var(--spacing-4);
  max-width: 960px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: var(--spacing-16) 0 var(--spacing-12);
}

.hero__title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: var(--spacing-6);
}

.hero__accent {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__description {
  max-width: 560px;
  margin: 0 auto var(--spacing-8);
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

.hero__stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-10);
  margin-bottom: var(--spacing-8);
}

.hero__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero__stat-value {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--accent-primary);
}

.hero__stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.hero__actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-4);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-8);
}

.hero__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-base);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.hero__btn--primary {
  background: var(--accent-primary);
  color: #ffffff;
}

.hero__btn--primary:hover {
  opacity: 0.9;
  text-decoration: none;
}

.hero__btn--secondary {
  border: 1px solid var(--border-secondary);
  color: var(--text-secondary);
}

.hero__btn--secondary:hover {
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.hero__kbd {
  padding: 0.1em 0.4em;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  font-family: var(--font-code);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.hero__progress {
  max-width: 400px;
  margin: 0 auto;
}

.hero__progress-label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-2);
}

.sections__title {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-6);
}

.sections__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-4);
}

.section-card {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  background: var(--bg-surface);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-fast);
}

.section-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  text-decoration: none;
}

.section-card__icon {
  font-size: 2rem;
  margin-bottom: var(--spacing-3);
}

.section-card__title {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-2);
  color: var(--text-primary);
}

.section-card__description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  flex: 1;
  margin-bottom: var(--spacing-3);
}

.section-card__count {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  font-weight: 500;
}

@media (max-width: 767px) {
  .hero {
    padding: var(--spacing-8) 0;
  }

  .hero__stats {
    gap: var(--spacing-6);
  }
}
</style>

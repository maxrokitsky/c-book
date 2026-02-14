<script setup lang="ts">
const props = defineProps<{
  prev: { sectionId: string; chapterId: string; title: string } | null
  next: { sectionId: string; chapterId: string; title: string } | null
}>()
</script>

<template>
  <nav class="footer-nav" aria-label="Навигация по главам">
    <RouterLink
      v-if="props.prev"
      :to="`/${props.prev.sectionId}/${props.prev.chapterId}`"
      class="footer-nav__link footer-nav__link--prev"
    >
      <svg
        class="footer-nav__arrow"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      <div class="footer-nav__text">
        <span class="footer-nav__label">Предыдущая</span>
        <span class="footer-nav__title">{{ props.prev.title }}</span>
      </div>
    </RouterLink>
    <div v-else class="footer-nav__spacer" />

    <RouterLink
      v-if="props.next"
      :to="`/${props.next.sectionId}/${props.next.chapterId}`"
      class="footer-nav__link footer-nav__link--next"
    >
      <div class="footer-nav__text footer-nav__text--right">
        <span class="footer-nav__label">Следующая</span>
        <span class="footer-nav__title">{{ props.next.title }}</span>
      </div>
      <svg
        class="footer-nav__arrow"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </RouterLink>
    <div v-else class="footer-nav__spacer" />
  </nav>
</template>

<style scoped>
.footer-nav {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: var(--spacing-4);
  margin-top: var(--spacing-12);
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--border-primary);
}

.footer-nav__spacer {
  flex: 1;
}

.footer-nav__link {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex: 1;
  padding: var(--spacing-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-primary);
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.footer-nav__link:hover {
  border-color: var(--accent-primary);
  background: var(--bg-surface);
}

.footer-nav__link--next {
  justify-content: flex-end;
}

.footer-nav__arrow {
  flex-shrink: 0;
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
}

.footer-nav__link:hover .footer-nav__arrow {
  color: var(--accent-primary);
}

.footer-nav__text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
}

.footer-nav__text--right {
  align-items: flex-end;
  text-align: right;
}

.footer-nav__label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.footer-nav__title {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--accent-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 767px) {
  .footer-nav {
    flex-direction: column;
  }

  .footer-nav__link--next {
    justify-content: flex-start;
    flex-direction: row-reverse;
  }

  .footer-nav__text--right {
    align-items: flex-start;
    text-align: left;
  }
}
</style>

<script setup lang="ts">
import { useNavigationStore } from '@/stores/navigation'
import { usePreferencesStore } from '@/stores/preferences'
import { useSearchStore } from '@/stores/search'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  minimal?: boolean
}>(), {
  minimal: false,
})

const navigation = useNavigationStore()
const preferences = usePreferencesStore()
const search = useSearchStore()

const isDark = computed(() => preferences.theme === 'dark')

function handleToggleSidebar() {
  navigation.toggleSidebar()
}

function handleToggleTheme() {
  preferences.toggleTheme()
}
</script>

<template>
  <header class="topbar">
    <div class="topbar__left">
      <button
        v-if="!props.minimal"
        class="topbar__btn topbar__hamburger"
        aria-label="Открыть меню"
        @click="handleToggleSidebar"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <RouterLink to="/" class="topbar__logo">
        Учебник C
      </RouterLink>
    </div>
    <div class="topbar__right">
      <button
        class="topbar__btn"
        aria-label="Поиск"
        @click="search.openSearch()"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
      <button
        class="topbar__btn"
        :aria-label="isDark ? 'Светлая тема' : 'Тёмная тема'"
        @click="handleToggleTheme"
      >
        <svg
          v-if="isDark"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg
          v-else
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  grid-area: topbar;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--topbar-height);
  padding: 0 var(--spacing-4);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.topbar__logo {
  font-family: var(--font-body);
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.topbar__logo:hover {
  color: var(--accent-primary);
}

.topbar__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.topbar__btn:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.topbar__hamburger {
  display: none;
}

@media (max-width: 767px) {
  .topbar__hamburger {
    display: flex;
  }
}
</style>

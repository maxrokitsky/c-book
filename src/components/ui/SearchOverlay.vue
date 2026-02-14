<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/search'

const search = useSearchStore()
const router = useRouter()
const inputRef = ref<HTMLInputElement | null>(null)
const selectedIndex = ref(0)

watch(
  () => search.isOpen,
  async (open) => {
    if (open) {
      await nextTick()
      inputRef.value?.focus()
      selectedIndex.value = 0
    }
  },
)

watch(
  () => search.query,
  () => {
    selectedIndex.value = 0
  },
)

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    search.closeSearch()
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, search.results.length - 1)
    return
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
    return
  }
  if (e.key === 'Enter' && search.results.length > 0) {
    e.preventDefault()
    navigate(selectedIndex.value)
  }
}

function navigate(index: number) {
  const result = search.results[index]
  if (!result) return
  if (result.chapter) {
    router.push(`/${result.sectionId}/${result.chapter.id}`)
  } else {
    router.push(`/${result.sectionId}`)
  }
  search.closeSearch()
}

function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    search.isOpen ? search.closeSearch() : search.openSearch()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="search.isOpen" class="search-overlay" @click.self="search.closeSearch()">
        <div class="search-dialog" @keydown="handleKeydown">
          <div class="search-dialog__input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-dialog__icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref="inputRef"
              v-model="search.query"
              type="text"
              placeholder="Поиск по учебнику..."
              class="search-dialog__input"
            >
            <kbd class="search-dialog__kbd">Esc</kbd>
          </div>
          <div v-if="search.results.length > 0" class="search-dialog__results">
            <button
              v-for="(result, index) in search.results"
              :key="`${result.sectionId}-${result.chapter?.id}`"
              :class="['search-dialog__result', { 'search-dialog__result--active': selectedIndex === index }]"
              @click="navigate(index)"
              @mouseenter="selectedIndex = index"
            >
              <span class="search-dialog__result-section">{{ result.sectionTitle }}</span>
              <span class="search-dialog__result-title">{{ result.chapter?.title || result.sectionTitle }}</span>
              <span class="search-dialog__result-desc">{{ result.chapter?.description || '' }}</span>
            </button>
          </div>
          <div v-else-if="search.query.length > 0" class="search-dialog__empty">
            Ничего не найдено
          </div>
          <div v-else class="search-dialog__hint">
            Начните вводить для поиска глав и разделов
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  background: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(4px);
}

.search-dialog {
  width: 100%;
  max-width: 560px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.search-dialog__input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--border-primary);
}

.search-dialog__icon {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.search-dialog__input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.search-dialog__input::placeholder {
  color: var(--text-tertiary);
}

.search-dialog__kbd {
  padding: 0.15em 0.5em;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  font-family: var(--font-code);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.search-dialog__results {
  max-height: 400px;
  overflow-y: auto;
  padding: var(--spacing-2);
}

.search-dialog__result {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  text-align: left;
  transition: background var(--transition-fast);
}

.search-dialog__result--active {
  background: var(--bg-surface-hover);
}

.search-dialog__result-section {
  font-size: var(--font-size-xs);
  color: var(--accent-primary);
  font-weight: 500;
}

.search-dialog__result-title {
  font-weight: 500;
  color: var(--text-primary);
}

.search-dialog__result-desc {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.search-dialog__empty,
.search-dialog__hint {
  padding: var(--spacing-8);
  text-align: center;
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity var(--transition-fast);
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
import TheSidebar from '@/components/layout/TheSidebar.vue'
import TheTopbar from '@/components/layout/TheTopbar.vue'
import { useNavigationStore } from '@/stores/navigation'
import { computed } from 'vue'

const navigation = useNavigationStore()

const sidebarOpen = computed(() => navigation.sidebarOpen)
</script>

<template>
  <div class="book-layout" :class="{ 'book-layout--sidebar-open': sidebarOpen }">
    <TheTopbar />
    <TheSidebar />
    <main class="book-layout__content">
      <div class="book-layout__inner">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.book-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: var(--topbar-height) 1fr;
  grid-template-areas:
    'topbar topbar'
    'sidebar content';
  height: 100vh;
  background: var(--bg-primary);
}

.book-layout__content {
  grid-area: content;
  padding: var(--spacing-8) var(--spacing-6);
  overflow-y: auto;
  min-width: 0;
}

.book-layout__inner {
  margin: 0 auto;
}

@media (max-width: 767px) {
  .book-layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      'topbar'
      'content';
  }

  .book-layout__content {
    padding: var(--spacing-6) var(--spacing-4);
  }
}
</style>

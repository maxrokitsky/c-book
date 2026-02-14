<script setup lang="ts">
import { tableOfContents } from '@/content/index'
import { useNavigationStore } from '@/stores/navigation'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const navigation = useNavigationStore()

const sidebarOpen = computed(() => navigation.sidebarOpen)

const currentSectionId = computed(() => route.params.sectionId as string | undefined)
const currentChapterId = computed(() => route.params.chapterId as string | undefined)

const sections = tableOfContents.sections

function isSectionExpanded(sectionId: string): boolean {
  return currentSectionId.value === sectionId
}

function isChapterActive(sectionId: string, chapterId: string): boolean {
  return currentSectionId.value === sectionId && currentChapterId.value === chapterId
}

function handleBackdropClick() {
  navigation.closeSidebar()
}

watch(
  () => route.fullPath,
  () => {
    if (window.innerWidth < 768) {
      navigation.closeSidebar()
    }
  },
)
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen }">
    <nav class="sidebar__nav">
      <div
        v-for="section in sections"
        :key="section.id"
        class="sidebar__section"
      >
        <RouterLink
          :to="`/${section.id}`"
          class="sidebar__section-header"
          :class="{ 'sidebar__section-header--active': currentSectionId === section.id }"
        >
          <span class="sidebar__section-icon">{{ section.icon }}</span>
          <span class="sidebar__section-title">{{ section.title }}</span>
        </RouterLink>
        <ul
          v-if="isSectionExpanded(section.id)"
          class="sidebar__chapters"
        >
          <li
            v-for="chapter in section.chapters"
            :key="chapter.id"
            class="sidebar__chapter"
          >
            <RouterLink
              :to="`/${section.id}/${chapter.id}`"
              class="sidebar__chapter-link"
              :class="{ 'sidebar__chapter-link--active': isChapterActive(section.id, chapter.id) }"
            >
              {{ chapter.title }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
  <div
    v-if="sidebarOpen"
    class="sidebar-backdrop"
    @click="handleBackdropClick"
  />
</template>

<style scoped>
.sidebar {
  grid-area: sidebar;
  position: fixed;
  top: var(--topbar-height);
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-primary);
  overflow-y: auto;
  z-index: 90;
  transition: transform var(--transition-base);
}

.sidebar__nav {
  padding: var(--spacing-4) 0;
}

.sidebar__section {
  margin-bottom: var(--spacing-2);
}

.sidebar__section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  font-weight: 700;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.sidebar__section-header:hover {
  background: var(--bg-surface-hover);
}

.sidebar__section-header--active {
  color: var(--accent-primary);
}

.sidebar__section-icon {
  flex-shrink: 0;
  font-size: var(--font-size-base);
}

.sidebar__section-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__chapters {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar__chapter {
  margin: 0;
}

.sidebar__chapter-link {
  display: block;
  padding: var(--spacing-1) var(--spacing-4) var(--spacing-1) var(--spacing-10);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);
  line-height: var(--line-height-normal);
}

.sidebar__chapter-link:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.sidebar__chapter-link--active {
  color: var(--accent-primary);
  background: var(--bg-surface);
  border-right: 2px solid var(--accent-primary);
}

.sidebar-backdrop {
  display: none;
}

@media (max-width: 767px) {
  .sidebar {
    transform: translateX(-100%);
    z-index: 95;
    box-shadow: var(--shadow-lg);
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    top: var(--topbar-height);
    z-index: 94;
    background: rgb(0 0 0 / 0.5);
  }
}
</style>

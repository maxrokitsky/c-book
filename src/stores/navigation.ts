import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNavigationStore = defineStore('navigation', () => {
  const sidebarOpen = ref(true)
  const sidebarCollapsed = ref(false)
  const currentSectionId = ref<string | null>(null)
  const currentChapterId = ref<string | null>(null)

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  function setCurrentLocation(sectionId: string, chapterId?: string) {
    currentSectionId.value = sectionId
    currentChapterId.value = chapterId ?? null
  }

  return {
    sidebarOpen,
    sidebarCollapsed,
    currentSectionId,
    currentChapterId,
    toggleSidebar,
    closeSidebar,
    setCurrentLocation,
  }
})

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const TOTAL_CHAPTERS = 60

function loadCompletedChapters(): Set<string> {
  const saved = localStorage.getItem('completedChapters')
  if (saved) {
    try {
      const arr = JSON.parse(saved) as string[]
      return new Set(arr)
    } catch {
      return new Set()
    }
  }
  return new Set()
}

function loadReadingProgress(): Record<string, number> {
  const saved = localStorage.getItem('readingProgress')
  if (saved) {
    try {
      return JSON.parse(saved) as Record<string, number>
    } catch {
      return {}
    }
  }
  return {}
}

export const useProgressStore = defineStore('progress', () => {
  const completedChapters = ref(loadCompletedChapters())
  const readingProgress = ref(loadReadingProgress())

  function persistCompleted() {
    localStorage.setItem(
      'completedChapters',
      JSON.stringify([...completedChapters.value]),
    )
  }

  function persistProgress() {
    localStorage.setItem('readingProgress', JSON.stringify(readingProgress.value))
  }

  function markCompleted(sectionId: string, chapterId: string) {
    const key = `${sectionId}/${chapterId}`
    completedChapters.value.add(key)
    completedChapters.value = new Set(completedChapters.value)
    persistCompleted()
  }

  function isCompleted(sectionId: string, chapterId: string): boolean {
    return completedChapters.value.has(`${sectionId}/${chapterId}`)
  }

  function setReadingProgress(sectionId: string, chapterId: string, percent: number) {
    const key = `${sectionId}/${chapterId}`
    readingProgress.value[key] = Math.max(0, Math.min(100, percent))
    readingProgress.value = { ...readingProgress.value }
    persistProgress()
  }

  function getReadingProgress(sectionId: string, chapterId: string): number {
    return readingProgress.value[`${sectionId}/${chapterId}`] ?? 0
  }

  const totalProgress = computed(() => {
    return Math.round((completedChapters.value.size / TOTAL_CHAPTERS) * 100)
  })

  return {
    completedChapters,
    readingProgress,
    markCompleted,
    isCompleted,
    setReadingProgress,
    getReadingProgress,
    totalProgress,
  }
})

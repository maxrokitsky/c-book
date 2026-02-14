import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { tableOfContents } from '@/content/index'
import type { ChapterMeta } from '@/content/types'

export interface SearchResult {
  type: 'section' | 'chapter'
  sectionId: string
  sectionTitle: string
  chapter?: ChapterMeta
}

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const isOpen = ref(false)

  const results = computed<SearchResult[]>(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return []

    const matches: SearchResult[] = []

    for (const section of tableOfContents.sections) {
      const sectionMatches = matchesQuery(section.title, q)
        || matchesQuery(section.description, q)

      if (sectionMatches) {
        matches.push({
          type: 'section',
          sectionId: section.id,
          sectionTitle: section.title,
        })
      }

      for (const chapter of section.chapters) {
        const chapterMatches = matchesQuery(chapter.title, q)
          || matchesQuery(chapter.description, q)

        if (chapterMatches) {
          matches.push({
            type: 'chapter',
            sectionId: section.id,
            sectionTitle: section.title,
            chapter,
          })
        }
      }
    }

    return matches
  })

  function matchesQuery(text: string, q: string): boolean {
    return text.toLowerCase().includes(q)
  }

  function openSearch() {
    isOpen.value = true
  }

  function closeSearch() {
    isOpen.value = false
    query.value = ''
  }

  return { query, isOpen, results, openSearch, closeSearch }
})

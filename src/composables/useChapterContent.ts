import { ref, shallowRef } from 'vue'
import type { Chapter } from '@/content/types'

const chapterModules = import.meta.glob<{ default: Chapter }>('@/content/section-*/*.ts')

const cache = new Map<string, Chapter>()

export function useChapterContent() {
  const chapter = shallowRef<Chapter | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadChapter(sectionId: string, chapterId: string) {
    const key = `${sectionId}/${chapterId}`

    if (cache.has(key)) {
      chapter.value = cache.get(key)!
      return
    }

    loading.value = true
    error.value = null

    const sectionMap: Record<string, string> = {
      language: 'section-1-language',
      projects: 'section-2-projects',
      practices: 'section-3-practices',
      environment: 'section-4-environment',
    }

    const sectionDir = sectionMap[sectionId]
    if (!sectionDir) {
      error.value = `Раздел "${sectionId}" не найден`
      loading.value = false
      return
    }

    const modulePath = `/src/content/${sectionDir}/${chapterId}.ts`
    const loader = chapterModules[modulePath]

    if (!loader) {
      error.value = `Глава "${chapterId}" не найдена`
      loading.value = false
      return
    }

    try {
      const mod = await loader()
      cache.set(key, mod.default)
      chapter.value = mod.default
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки главы'
    } finally {
      loading.value = false
    }
  }

  return { chapter, loading, error, loadChapter }
}

import { ref, shallowRef } from 'vue'
import type { Highlighter } from 'shiki'

const highlighter = shallowRef<Highlighter | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function ensureHighlighter() {
  if (highlighter.value) return highlighter.value
  if (loading.value) {
    // Wait for existing load
    return new Promise<Highlighter>((resolve) => {
      const check = setInterval(() => {
        if (highlighter.value) {
          clearInterval(check)
          resolve(highlighter.value)
        }
      }, 50)
    })
  }

  loading.value = true
  try {
    const { createHighlighter } = await import('shiki')
    highlighter.value = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['c', 'bash', 'makefile', 'json', 'plaintext'],
    })
    return highlighter.value
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load highlighter'
    throw e
  } finally {
    loading.value = false
  }
}

export function useCodeHighlighter() {
  async function highlight(code: string, language = 'c') {
    const hl = await ensureHighlighter()
    return hl.codeToHtml(code, {
      lang: language,
      themes: {
        dark: 'github-dark',
        light: 'github-light',
      },
      defaultColor: 'dark',
    })
  }

  return { highlight, loading, error }
}

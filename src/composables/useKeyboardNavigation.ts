import { onMounted, onUnmounted, type Ref } from 'vue'
import { useRouter } from 'vue-router'

export function useKeyboardNavigation(options: {
  prev: Ref<{ sectionId: string; chapterId: string; title: string } | null>
  next: Ref<{ sectionId: string; chapterId: string; title: string } | null>
  onSearchOpen?: () => void
}) {
  const router = useRouter()

  function handleKeydown(e: KeyboardEvent) {
    // Cmd/Ctrl+K → open search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      options.onSearchOpen?.()
      return
    }

    // Don't navigate if user is typing in an input
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return
    }

    const prev = options.prev.value
    const next = options.next.value

    // Arrow left → previous chapter
    if (e.key === 'ArrowLeft' && e.altKey && prev) {
      e.preventDefault()
      router.push(`/${prev.sectionId}/${prev.chapterId}`)
    }

    // Arrow right → next chapter
    if (e.key === 'ArrowRight' && e.altKey && next) {
      e.preventDefault()
      router.push(`/${next.sectionId}/${next.chapterId}`)
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
}

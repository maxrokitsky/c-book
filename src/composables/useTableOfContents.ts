import { ref, onMounted, onUnmounted } from 'vue'

export interface TocHeading {
  id: string
  text: string
  level: number
}

export function useTableOfContents(containerSelector = '.chapter-content') {
  const headings = ref<TocHeading[]>([])
  const activeId = ref('')

  let intersectionObserver: IntersectionObserver | null = null
  let mutationObserver: MutationObserver | null = null

  function extractHeadings() {
    const container = document.querySelector(containerSelector)
    if (!container) return

    const elements = container.querySelectorAll('h2, h3')
    headings.value = Array.from(elements).map((el) => ({
      id: el.id || slugify(el.textContent || ''),
      text: el.textContent || '',
      level: parseInt(el.tagName.charAt(1)),
    }))

    // Ensure IDs are set
    elements.forEach((el, i) => {
      if (!el.id && headings.value[i]) {
        el.id = headings.value[i].id
      }
    })

    // Default to first heading
    if (headings.value.length && !activeId.value) {
      activeId.value = headings.value[0].id
    }
  }

  function setupIntersectionObserver() {
    const container = document.querySelector(containerSelector)
    if (!container) return

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeId.value = entry.target.id
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    )

    const elements = container.querySelectorAll('h2, h3')
    elements.forEach((el) => intersectionObserver!.observe(el))
  }

  function setupMutationObserver() {
    const container = document.querySelector(containerSelector)
    if (!container) return

    mutationObserver = new MutationObserver(() => {
      const currentCount = container.querySelectorAll('h2, h3').length
      if (currentCount !== headings.value.length) {
        intersectionObserver?.disconnect()
        extractHeadings()
        setupIntersectionObserver()
      }
    })

    mutationObserver.observe(container, { childList: true, subtree: true })
  }

  onMounted(() => {
    extractHeadings()
    setupIntersectionObserver()
    setupMutationObserver()
  })

  onUnmounted(() => {
    intersectionObserver?.disconnect()
    mutationObserver?.disconnect()
  })

  function refresh() {
    intersectionObserver?.disconnect()
    mutationObserver?.disconnect()
    activeId.value = ''
    extractHeadings()
    setupIntersectionObserver()
    setupMutationObserver()
  }

  return { headings, activeId, refresh }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-а-яё]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
